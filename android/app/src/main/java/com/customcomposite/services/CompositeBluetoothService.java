package com.customcomposite.services;

import android.app.ActivityManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Binder;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.IBinder;
import android.os.Looper;
import android.os.Message;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.customcomposite.MainActivity;
import com.customcomposite.R;
import com.customcomposite.controller.BluetoothController;
import com.customcomposite.controller.ConnectListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.facebook.react.HeadlessJsTaskService;

import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

public class CompositeBluetoothService extends HeadlessJsTaskService {
    private String PERIPHERAL_ID = null;
    private BluetoothController controller;
    public static boolean IS_RUNNING = false;
    private static final String CHANNEL_ID = "Composite channel";
    private static final int NOTIFICATION_ID = 12345678;
    private final IBinder mBinder = new LocalBinder();
    private boolean mChangingConfiguration = false;

    public CompositeBluetoothService() {
    }

    @Nullable
    @Override
    protected HeadlessJsTaskConfig getTaskConfig(Intent intent) {
        Bundle extras = intent.getExtras();
        if (extras != null) {
            return new HeadlessJsTaskConfig(
                    "Headless",
                    Arguments.fromBundle(extras),
                    5000, // timeout for the task
                    true // optional: defines whether or not  the task is allowed in foreground. Default is false
            );
        }
        return null;
    }


    @Override
    public void onCreate() {
        super.onCreate();
        controller = new BluetoothController();

        if(PERIPHERAL_ID == null){
            PERIPHERAL_ID = Utils.fetchMacAddress(this);
            controller.connect(PERIPHERAL_ID, this);
        }

        controller.init(new ConnectListener() {
            @Override
            public void onBLEConnect() {
                // #todo display notif or toast of status
                Toast.makeText(CompositeBluetoothService.this, "Device connected", Toast.LENGTH_SHORT).show();
                Log.d(Utils.TAG, "Connect event run");
            }

            @Override
            public void onBLEDisconnect() {
                // #todo launch retries and handle eventualities
                Toast.makeText(CompositeBluetoothService.this, "Device disconnected", Toast.LENGTH_SHORT).show();
                Log.d(Utils.TAG, "disconnect event run");
                for(int i = 0; i < 3; i++){
                    Log.d(Utils.TAG, "Connection retrying" + " " + i);
                    controller.connect(PERIPHERAL_ID, CompositeBluetoothService.this);
                }
            }

            @Override
            public void onCharacteristicChanged(byte[] packet) {
                try{
                    Map<String, Object> parsedData = Utils.parseDataPacket(packet);
                    FirebaseDatabase database = FirebaseDatabase.getInstance();
                    DatabaseReference reference = database.getReference("/background");
                    DatabaseReference newRef = reference.push();
                    Log.d(Utils.TAG, "identification code: " + parsedData.get("identificationCode")
                            + " dataOutLength: " + parsedData.get("dataOutLength") + " cmdCode: " +
                            parsedData.get("cmdCode") + " para: " + parsedData.get("para"));
                    newRef.setValue(parsedData);
                } catch(Exception e){
                    e.printStackTrace();
                }
            }
        });
        AtomicBoolean isPeripheralConnected = new AtomicBoolean(false);
        Handler btHandler = new Handler();
        Runnable checkBT = () -> {
            isPeripheralConnected.set(PERIPHERAL_ID != null && controller.isConnected(PERIPHERAL_ID));
            if(PERIPHERAL_ID != null && !isPeripheralConnected.get()){
                Log.d(Utils.TAG, "Controller disconnected");
                isPeripheralConnected.set(controller.isConnected(PERIPHERAL_ID));
                if (!isPeripheralConnected.get()){
                    Log.d(Utils.TAG, "Unable to connect to peripheral");
                }
            }
            Log.d(Utils.TAG, isPeripheralConnected.get() ? "Connected to peripheral" : "Peripheral not connected");
        };

        btHandler.postDelayed(checkBT, 300);
        if(isPeripheralConnected.get()){
            Handler handler = new Handler();

            Runnable task = () -> {
                // Perform the task here
                controller.increasePressure();
            };
            handler.postDelayed(task, 600);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(Utils.TAG, "service running outside");
        if(intent.getAction().equals(Utils.ACTION_START_SERVICE)){
            Toast.makeText(this, "Service running", Toast.LENGTH_SHORT).show();
            Log.d(Utils.TAG, "service running with id " + PERIPHERAL_ID);
            PERIPHERAL_ID = intent.getStringExtra(Utils.HANDLE);
            createNotificationChannel();
            startForeground(NOTIFICATION_ID, buildNotification());
            IS_RUNNING = true;
        } else if(intent.getAction().equals(Utils.ACTION_STOP_SERVICE)) {
            Toast.makeText(this, "Service stopped", Toast.LENGTH_SHORT).show();
            Log.d(Utils.TAG, "service stopped");
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                stopForeground(flags);
            }
            stopForeground(true);
            stopSelfResult(startId);
            IS_RUNNING = false;
        }

        return START_STICKY;
    }

    private Notification buildNotification(){
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this,
                0, notificationIntent, 0);
        Intent stopServiceIntent = new Intent(this, CompositeBluetoothService.class);
        stopServiceIntent.setAction(Utils.ACTION_STOP_SERVICE);
        PendingIntent stopServicePending = PendingIntent.getService(this, 0, stopServiceIntent, 0);


        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Composite updates")
                .setContentText("Pressure readings monitored")
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(pendingIntent)
                .setPriority(Notification.PRIORITY_HIGH)
                .setWhen(System.currentTimeMillis())
                .addAction(android.R.drawable.ic_menu_close_clear_cancel, "close", stopServicePending)
                .build();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Foreground Service Channel",
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(serviceChannel);
        }
    }

    public class LocalBinder extends Binder {
        CompositeBluetoothService getService() {
            return CompositeBluetoothService.this;
        }
    }

    private boolean checkIfConnected(){
        // #TODO check if bluetooth connection with BLE peripheral still valid
        return false;
    }

    @Override
    public IBinder onBind(Intent intent) {
        // TODO: Return the communication channel to the service.
        stopForeground(true);
       return mBinder;
    }

    @Override
    public void onRebind(Intent intent) {
        // Called when a client (MainActivity in case of this sample) returns to the foreground
        // and binds once again with this service. The service should cease to be a foreground
        // service when that happens.
        Log.i(Utils.TAG, "in onRebind()");
        stopForeground(true);
        mChangingConfiguration = false;
        super.onRebind(intent);
    }

    @Override
    public boolean onUnbind(Intent intent) {
        Log.i(Utils.TAG, "Last client unbound from service");

        // Called when the last client (MainActivity in case of this sample) unbinds from this
        // service. If this method is called due to a configuration change in MainActivity, we
        // do nothing. Otherwise, we make this service a foreground service.
        if (!mChangingConfiguration) {
            Log.i(Utils.TAG, "Starting foreground service");
            /*
            // TODO(developer). If targeting O, use the following code.
            if (Build.VERSION.SDK_INT == Build.VERSION_CODES.O) {
                mNotificationManager.startServiceInForeground(new Intent(this,
                        LocationUpdatesService.class), NOTIFICATION_ID, getNotification());
            } else {
                startForeground(NOTIFICATION_ID, getNotification());
            }
             */
            startForeground(NOTIFICATION_ID, buildNotification());
        }
        return true; // Ensures onRebind() is called when a client re-binds.
    }

    private boolean isAppOnForeground(Context context) {
        /**
         We need to check if app is in foreground otherwise the app will crash.
         http://stackoverflow.com/questions/8489993/check-android-application-is-in-foreground-or-not
         **/
        ActivityManager activityManager = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
        List<ActivityManager.RunningAppProcessInfo> appProcesses =
                activityManager.getRunningAppProcesses();
        if (appProcesses == null) {
            return false;
        }
        final String packageName = context.getPackageName();
        for (ActivityManager.RunningAppProcessInfo appProcess : appProcesses) {
            if (appProcess.importance ==
                    ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND &&
                    appProcess.processName.equals(packageName)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        IS_RUNNING = false;
    }

    private class MyHandlerThread extends HandlerThread {
        private Handler mWorkerHandler;
        private String result;

        public MyHandlerThread(String name) {
            super(name);
        }

        @Override
        protected void onLooperPrepared() {
            mWorkerHandler = new Handler(getLooper()) {
                @Override
                public void handleMessage(Message msg) {
                    // Perform task in background thread
                    result = Utils.fetchMacAddress(CompositeBluetoothService.this);
                    // Update UI on main thread
                    new Handler(Looper.getMainLooper()).post(new Runnable() {
                        @Override
                        public void run() {
                            // Use the result here
                            Log.d(Utils.TAG, "Running result of background work here = " + result);
                            PERIPHERAL_ID = result;
                        }
                    });
                }
            };
        }

        public void enqueueWork(String input) {
            mWorkerHandler.obtainMessage(0, input).sendToTarget();
        }
    }
}