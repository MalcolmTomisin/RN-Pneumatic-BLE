package com.customcomposite.controller;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import androidx.core.app.ActivityCompat;

import com.customcomposite.services.Utils;

import java.util.Queue;
import java.util.UUID;
import java.util.concurrent.ConcurrentLinkedQueue;

public class BluetoothController implements Control {
    private BluetoothAdapter bluetoothAdapter;
    private static final String TAG = "Bluetooth Controller";
    private BluetoothGatt bluetoothGatt;
    private ConnectListener listener;
    private BluetoothDevice device;
    private final Queue<Runnable> commandQueue = new ConcurrentLinkedQueue<>();
    private BluetoothManager manager;
    private Context context;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private String PERIPHERAL_ID = null;
    private long timeBoundary = System.currentTimeMillis();

    private final BluetoothGattCallback bluetoothGattCallback = new BluetoothGattCallback() {
        @Override
        public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
            if (newState == BluetoothProfile.STATE_CONNECTED) {
                // successfully connected to the GATT Server
                if (listener != null) {
                    listener.onBLEConnect();
                }

            } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                // disconnected from the GATT Server
                if (listener != null) {
                    listener.onBLEDisconnect();
                }
            }
        }

        @Override
        public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
            super.onCharacteristicChanged(gatt, characteristic);
            if (listener != null) {
                listener.onCharacteristicChanged(characteristic.getValue());
            }
        }
    };


    public boolean init(ConnectListener listener, Context serviceContext, String peripheral) {
        this.context = serviceContext;
        manager = (BluetoothManager) context.getSystemService(Context.BLUETOOTH_SERVICE);
        bluetoothAdapter = manager.getAdapter();
        this.listener = listener;
        this.PERIPHERAL_ID = peripheral;
        if (bluetoothAdapter == null) {
            Log.e(TAG, "Unable to obtain a BluetoothAdapter.");
            return false;
        }
        Log.d(TAG, "bluetooth adapter successfully initialized");
        return true;
    }

    public void connect() {
        if (bluetoothAdapter == null || PERIPHERAL_ID == null) {
            Log.d(TAG, "BluetoothAdapter not initialized or unspecified address.");
            return;
        }
        try {
            device = bluetoothAdapter.getRemoteDevice(PERIPHERAL_ID);
            // connect to the GATT server on the device
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (ActivityCompat.checkSelfPermission(this.context, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
                    // TODO: Consider calling
                    //    ActivityCompat#requestPermissions
                    // here to request the missing permissions, and then overriding
                    //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
                    //                                          int[] grantResults)
                    // to handle the case where the user grants the permission. See the documentation
                    // for ActivityCompat#requestPermissions for more details.
                    if (ActivityCompat.shouldShowRequestPermissionRationale((Activity) this.context, Manifest.permission.BLUETOOTH_CONNECT)) {

                    } else {
                        ActivityCompat.requestPermissions((Activity) this.context, new String[]{Manifest.permission.BLUETOOTH_CONNECT}, 0);

                    }
                    Log.d(TAG, "Bluetooth controller doesn't have permission");

                }
            }
            final boolean success = commandQueue.add(() -> bluetoothGatt = device.connectGatt(this.context, false, bluetoothGattCallback));
            if (success) {
                nextCommand();
            } else {
                Log.d(Utils.TAG, "operation could not be queued");
            }

            Log.d(TAG, "Connection successful");

        } catch (IllegalArgumentException exception) {
            Log.d(TAG, "Device not found with provided address.  Unable to connect.");

        }
    }

    @SuppressLint("MissingPermission")
    private void retrieveServices(){
        if(bluetoothGatt != null){
            if(getConnectionState() == BluetoothProfile.STATE_CONNECTED){
                bluetoothGatt.discoverServices();
            }
        }
    }

    @SuppressLint("MissingPermission")
    public void registerForNotifications(){
        if(bluetoothGatt != null){
            retrieveServices();
            Log.d(TAG, "registration ongoing...");
            UUID serviceUUID = UUID.fromString("0000FFF0-0000-1000-8000-00805F9B34FB");
            UUID charUUID = UUID.fromString("0000FFF6-0000-1000-8000-00805F9B34FB");
            BluetoothGattService service = bluetoothGatt.getService(serviceUUID);
            BluetoothGattCharacteristic characteristic = service.getCharacteristic(charUUID);
            bluetoothGatt.setCharacteristicNotification(characteristic, true);
            BluetoothGattDescriptor descriptor = characteristic.getDescriptor(charUUID);
            descriptor.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
            final boolean success = commandQueue.add(() -> bluetoothGatt.writeDescriptor(descriptor));

            if(success){
                Log.d(TAG, "registration successful");
                nextCommand();
            } else {
                Log.d(TAG, "operation could not be queued");
            }
        }
    }


    @Override
    public void increasePressure() {
        if (bluetoothGatt != null) {
            try {
                Log.d(TAG, "write ongoing...");
                UUID serviceUUID = UUID.fromString("0000FFF0-0000-1000-8000-00805F9B34FB");
                UUID charUUID = UUID.fromString("0000FFF6-0000-1000-8000-00805F9B34FB");
                BluetoothGattService service = bluetoothGatt.getService(serviceUUID);
                BluetoothGattCharacteristic characteristic = service.getCharacteristic(charUUID);

                //write value to characteristic
                byte[] value = new byte[]{0x55, (byte) 0xaa, 0x01, 0x24, 0x00};
                characteristic.setValue(value);
                final boolean success = commandQueue.add(() -> bluetoothGatt.writeCharacteristic(characteristic));

                if (success) {
                    Log.d(TAG, "command successfully added to the command queue");
                    nextCommand();
                } else {
                    Log.d(TAG, "operation could not be queued");
                }
            } catch (SecurityException e) {
                e.printStackTrace();
            }
        }
    }

    @Override
    public void decreasePressure() {

    }

    @Override
    public void cleanup() {
        if (bluetoothGatt == null) {
            return;
        }
        try {
            bluetoothGatt.close();
            bluetoothGatt = null;
            context = null;
            manager = null;
        } catch (SecurityException e) {
            e.printStackTrace();
        }
    }

    @Override
    public int getConnectionState() {
        if (bluetoothAdapter == null || bluetoothGatt == null || manager == null) {
            return BluetoothProfile.STATE_DISCONNECTED;
        }
        if (device == null) {
            device = bluetoothAdapter.getRemoteDevice(PERIPHERAL_ID);
        }
        if (ActivityCompat.checkSelfPermission(this.context, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
            // TODO: Consider calling
            //    ActivityCompat#requestPermissions
            // here to request the missing permissions, and then overriding
            //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
            //                                          int[] grantResults)
            // to handle the case where the user grants the permission. See the documentation
            // for ActivityCompat#requestPermissions for more details.
            if (ActivityCompat.shouldShowRequestPermissionRationale((Activity) this.context, Manifest.permission.BLUETOOTH_CONNECT)) {

            } else {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    ActivityCompat.requestPermissions((Activity) this.context, new String[]{Manifest.permission.BLUETOOTH_CONNECT}, 0);
                }

            }
            Log.d(TAG, "Bluetooth controller doesn't have permission");
            return BluetoothProfile.STATE_DISCONNECTED;

        }
        return manager.getConnectionState(device, BluetoothGatt.GATT_SERVER);
    }

    private void nextCommand(){
            synchronized (this){
                if(bluetoothGatt != null){
                    final Runnable nextCommand = commandQueue.poll();
                    if (nextCommand != null){
                        while(System.currentTimeMillis() - timeBoundary < 600){

                        }
                        mainHandler.postDelayed(nextCommand, 0);
                        timeBoundary = System.currentTimeMillis();

                    }
                }
            }
    }
}
