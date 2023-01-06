package com.customcomposite.controller;

public interface ConnectListener {

    public void onBLEConnect();

    public void onBLEDisconnect();

    public void onCharacteristicChanged(byte[] bytes);
}
