package com.customcomposite.controller;

public interface Control {
    public void increasePressure();

    public void decreasePressure();

    public void cleanup();

    // refactor this to use the bluetooth manager API
    public int getConnectionState();
}
