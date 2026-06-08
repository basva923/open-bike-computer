package com.openbikecomputer.service;

/**
 * Bluetooth cycling power meter. Ported from {@code IPowerMeterService.ts}.
 */
public interface IPowerMeterService {
    void selectNewDevice();

    void reconnectToLastConnected();

    void disconnect();

    boolean isConnected();

    boolean isDeviceSelected();

    String getDeviceName();

    void subscribeForPowerData(OnPowerData listener);

    void unsubscribeForPowerData(OnPowerData listener);
}
