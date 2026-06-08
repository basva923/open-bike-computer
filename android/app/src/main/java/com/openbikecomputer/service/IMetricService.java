package com.openbikecomputer.service;

/**
 * Subset of the metric service required by {@code Metric} implementations to
 * reach the underlying sensor services. Ported from {@code IMetricService.ts}.
 */
public interface IMetricService {
    ILocationService getLocationService();

    IHeartRateSensorService getHeartRateSensorService();

    IPowerMeterService getPowerMeterService();

    ISpeedSensorService getSpeedSensorService();
}
