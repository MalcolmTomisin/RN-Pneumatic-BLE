package com.customcomposite.controller;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothProfile;
import android.content.Context;
import android.content.pm.PackageManager;
import android.util.Log;

import androidx.core.app.ActivityCompat;

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
        return true;
    }

    public boolean connect(final String PERIPHERAL, final Context ctx) {
        if (bluetoothAdapter == null || PERIPHERAL == null) {
            Log.w(TAG, "BluetoothAdapter not initialized or unspecified address.");
            return false;
        }
        try {
            device = bluetoothAdapter.getRemoteDevice(PERIPHERAL);
            // connect to the GATT server on the device
            if (ActivityCompat.checkSelfPermission(ctx, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
                // TODO: Consider calling
                //    ActivityCompat#requestPermissions
                // here to request the missing permissions, and then overriding
                //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
                //                                          int[] grantResults)
                // to handle the case where the user grants the permission. See the documentation
                // for ActivityCompat#requestPermissions for more details.
                Log.w(TAG, "Bluetooth controller doesn't have permission");
                return false;
            }
            bluetoothGatt = device.connectGatt(ctx, false, bluetoothGattCallback);
            return true;
        } catch (IllegalArgumentException exception) {
            Log.w(TAG, "Device not found with provided address.  Unable to connect.");
            return false;
        }
    }



    @Override
    public void increasePressure() {

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
