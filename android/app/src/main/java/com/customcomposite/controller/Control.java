package com.customcomposite.controller;

public interface Control {
    public void increasePressure();

    public void decreasePressure();

    public void cleanup();

    public boolean isConnected(final String ID);
}
