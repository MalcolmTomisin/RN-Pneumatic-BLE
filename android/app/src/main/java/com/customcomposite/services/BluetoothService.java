package com.customcomposite.services;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;

import com.customcomposite.controller.BluetoothController;
import com.customcomposite.controller.ConnectListener;

public class BluetoothService extends Service {
    private String PERIPHERAL_ID = null;
    private BluetoothController controller;

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
            }

            @Override
            public void onBLEDisconnect() {
                // #todo launch retries and handle eventualities
            }
        });
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {

        return START_NOT_STICKY;
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