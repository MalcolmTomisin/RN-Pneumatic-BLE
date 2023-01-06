package com.customcomposite.services;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.widget.Toast;

import androidx.core.app.NotificationCompat;

import com.customcomposite.MainActivity;
import com.customcomposite.R;
import com.customcomposite.controller.BluetoothController;
import com.customcomposite.controller.ConnectListener;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Map;

public class BluetoothService extends Service {
    private String PERIPHERAL_ID = null;
    private BluetoothController controller;
    public static boolean IS_RUNNING = false;
    private static final String CHANNEL_ID = "Composite channel";
    private static final int NOTIFICATION_ID = 12345678;

    public BluetoothService() {
    }

    @Override
    public void onCreate() {
        super.onCreate();
        controller = new BluetoothController();
        controller.init(new ConnectListener() {
            @Override
            public void onBLEConnect() {
                // #todo display notif or toast of status
                Toast.makeText(BluetoothService.this, "Device connected", Toast.LENGTH_SHORT).show();

            }

            @Override
            public void onBLEDisconnect() {
                // #todo launch retries and handle eventualities
                Toast.makeText(BluetoothService.this, "Device disconnected", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onCharacteristicChanged(byte[] packet) {
                try{
                    Map<String, Object> parsedData = Utils.parseDataPacket(packet);
                    FirebaseDatabase database = FirebaseDatabase.getInstance();
                    DatabaseReference reference = database.getReference("/background");
                    DatabaseReference newRef = reference.push();
                    newRef.setValue(parsedData);
                } catch(Exception e){
                    e.printStackTrace();
                }
            }
        });
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if(intent.getAction().equals(Utils.ACTION_START_SERVICE)){
            PERIPHERAL_ID = intent.getStringExtra(Utils.HANDLE);
            createNotificationChannel();
            startForeground(NOTIFICATION_ID, buildNotification());
            IS_RUNNING = true;
        } else if(intent.getAction().equals(Utils.ACTION_STOP_SERVICE)) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                stopForeground(flags);
            }
            stopForeground(true);
            stopSelfResult(startId);
            IS_RUNNING = false;
        }

        return START_NOT_STICKY;
    }

    private Notification buildNotification(){
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this,
                0, notificationIntent, 0);
        Intent stopServiceIntent = new Intent(this, BluetoothService.class);
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

    private boolean checkIfConnected(){
        // #TODO check if bluetooth connection with BLE peripheral still valid
        return false;
    }

    @Override
    public IBinder onBind(Intent intent) {
        // TODO: Return the communication channel to the service.
        throw new UnsupportedOperationException("Not yet implemented");
    }
}