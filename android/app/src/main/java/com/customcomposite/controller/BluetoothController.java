package com.customcomposite.controller;

import android.Manifest;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothProfile;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Log;

import androidx.core.app.ActivityCompat;

import java.util.UUID;

public class BluetoothController implements Control {
    private BluetoothAdapter bluetoothAdapter;
    private static final String TAG = "Bluetooth Controller";
    private BluetoothGatt bluetoothGatt;
    private boolean connected = false;
    private ConnectListener listener;
    private BluetoothDevice device;

    private final BluetoothGattCallback bluetoothGattCallback = new BluetoothGattCallback() {
        @Override
        public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
            if (newState == BluetoothProfile.STATE_CONNECTED) {
                // successfully connected to the GATT Server
                if (listener != null){
                    listener.onBLEConnect();
                }
                connected = true;
            } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                // disconnected from the GATT Server
                if (listener != null){
                    listener.onBLEDisconnect();
                }
                connected = false;
            }
        }

        @Override
        public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
            super.onCharacteristicChanged(gatt, characteristic);
            if(listener != null){
                listener.onCharacteristicChanged(characteristic.getValue());
            }
        }
    };


    public boolean init(ConnectListener listener) {
        bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        this.listener = listener;
        if (bluetoothAdapter == null) {
            Log.e(TAG, "Unable to obtain a BluetoothAdapter.");
            return false;
        }
        Log.d(TAG, "bluetooth adapter successfully initialized");
        return true;
    }

    public void connect(final String PERIPHERAL, final Context ctx) {
        if (bluetoothAdapter == null || PERIPHERAL == null) {
            Log.d(TAG, "BluetoothAdapter not initialized or unspecified address.");
        }
        try {
            device = bluetoothAdapter.getRemoteDevice(PERIPHERAL);
            // connect to the GATT server on the device
            if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.S){
                if (ActivityCompat.checkSelfPermission(ctx, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
                    // TODO: Consider calling
                    //    ActivityCompat#requestPermissions
                    // here to request the missing permissions, and then overriding
                    //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
                    //                                          int[] grantResults)
                    // to handle the case where the user grants the permission. See the documentation
                    // for ActivityCompat#requestPermissions for more details.
                    if(ActivityCompat.shouldShowRequestPermissionRationale((Activity) ctx, Manifest.permission.BLUETOOTH_CONNECT)){

                    }else {
                        ActivityCompat.requestPermissions((Activity) ctx,new String[] {Manifest.permission.BLUETOOTH_CONNECT}, 0);

                    }
                    Log.d(TAG, "Bluetooth controller doesn't have permission");

                }
            }
            bluetoothGatt = device.connectGatt(ctx, false, bluetoothGattCallback);
            Log.d(TAG, "Connection successful");

        } catch (IllegalArgumentException exception) {
            Log.d(TAG, "Device not found with provided address.  Unable to connect.");

        }
    }



    @Override
    public void increasePressure() {
     if(bluetoothGatt != null){
         try{
             UUID serviceUUID = UUID.fromString("0000FFF0-0000-1000-8000-00805F9B34FB");
             UUID charUUID = UUID.fromString("0000FFF6-0000-1000-8000-00805F9B34FB");
             BluetoothGattService service = bluetoothGatt.getService(serviceUUID);
             BluetoothGattCharacteristic characteristic = service.getCharacteristic(charUUID);

//write value to characteristic
             byte[] value = new byte[]{0x55, (byte) 0xaa, 0x01, 0x24, 0x00 };
             characteristic.setValue(value);
             bluetoothGatt.writeCharacteristic(characteristic);
         }
         catch(SecurityException e){
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
        try{
            bluetoothGatt.close();
            bluetoothGatt = null;
        } catch (SecurityException e){
            e.printStackTrace();
        }
    }

    // refactor this to use the bluetooth manager API
    @Override
    public boolean isConnected(final String PERIPHERAL_ID) {
        if (bluetoothAdapter != null && bluetoothGatt != null){
            return BluetoothGatt.STATE_CONNECTED == bluetoothGatt.getConnectionState(device);
        }
        return connected;
    }
}
