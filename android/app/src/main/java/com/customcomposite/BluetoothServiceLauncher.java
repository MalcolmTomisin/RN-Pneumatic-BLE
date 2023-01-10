package com.customcomposite;

import android.content.Intent;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.customcomposite.services.BluetoothService;
import com.customcomposite.services.Utils;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class BluetoothServiceLauncher extends ReactContextBaseJavaModule {

    ReactApplicationContext reactContext;

    public BluetoothServiceLauncher(@Nullable ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "BluetoothServiceLauncher";
    }


    @ReactMethod
    public void launchService(String peripheralId){
        Toast.makeText(reactContext, "Calling the service", Toast.LENGTH_SHORT).show();
        if(BluetoothService.IS_RUNNING){
            Toast.makeText(reactContext, "Bluetooth service already running", Toast.LENGTH_SHORT).show();
            Log.d(Utils.TAG, "Service already running " + peripheralId);
            return;
        }
        Log.d(Utils.TAG, "Event running with token: " + peripheralId);
        Intent startIntent = new Intent(reactContext, BluetoothService.class);
        startIntent.setAction(Utils.ACTION_START_SERVICE);
        startIntent.putExtra(Utils.HANDLE, peripheralId);
        reactContext.startService(startIntent);
    }


    @ReactMethod
    public void closeService(){
        if(!BluetoothService.IS_RUNNING){
            return;
        }
        Intent stopIntent = new Intent(reactContext, BluetoothService.class);
        stopIntent.setAction(Utils.ACTION_STOP_SERVICE);
        reactContext.stopService(stopIntent);
    }

}
