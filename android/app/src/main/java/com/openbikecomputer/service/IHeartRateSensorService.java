package com.openbikecomputer.service;

/**
 * Bluetooth heart-rate sensor. Ported from {@code IHeartRateSensorService.ts}.
 */
public interface IHeartRateSensorService {
    void selectNewDevice();

    void reconnectToLastConnected();

    void disconnect();

    boolean isConnected();

    boolean isDeviceSelected();

    String getDeviceName();

    void subscribeForHeartRate(OnHeartRate listener);

    void unsubscribeForHeartRate(OnHeartRate listener);
}
