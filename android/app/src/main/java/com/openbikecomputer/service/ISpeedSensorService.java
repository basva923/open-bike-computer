package com.openbikecomputer.service;

/**
 * Bluetooth cycling speed and cadence sensor. Ported from {@code ISpeedSensorService.ts}.
 */
public interface ISpeedSensorService {
    void selectNewDevice();

    void reconnectToLastConnected();

    void disconnect();

    boolean isConnected();

    boolean isDeviceSelected();

    String getDeviceName();

    void subscribeForSpeedData(OnSpeedData listener);

    void unsubscribeForSpeedData(OnSpeedData listener);
}
