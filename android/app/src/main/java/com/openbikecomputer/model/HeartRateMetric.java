package com.openbikecomputer.model;

import com.openbikecomputer.service.IMetricService;
import com.openbikecomputer.service.OnHeartRate;

public class HeartRateMetric extends Metric implements OnHeartRate {
    public HeartRateMetric(IMetricService metricService) {
        super(MetricType.HEART_RATE, "Heart Rate", "bpm", metricService);
    }

    @Override
    public void startLogging() {
        metricService.getHeartRateSensorService().subscribeForHeartRate(this);
    }

    @Override
    public void stopLogging() {
        metricService.getHeartRateSensorService().unsubscribeForHeartRate(this);
    }

    @Override
    public void onHeartRate(HeartRateData data) {
        addValue(data.heartRate, data.timestamp);
    }
}
