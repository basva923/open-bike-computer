package com.openbikecomputer.model;

import com.openbikecomputer.service.IMetricService;
import com.openbikecomputer.service.OnSpeedData;

public class WheelRotationsMetric extends Metric implements OnSpeedData {
    public WheelRotationsMetric(IMetricService metricService) {
        super(MetricType.WHEEL_ROTATIONS, "Wheel Rotations", "", metricService, "");
    }

    @Override
    public void startLogging() {
        metricService.getSpeedSensorService().subscribeForSpeedData(this);
    }

    @Override
    public void stopLogging() {
        metricService.getSpeedSensorService().unsubscribeForSpeedData(this);
    }

    @Override
    public void onSpeedData(SpeedSensorData data) {
        if (data.cumulativeWheelRevolutions == null || data.cumulativeWheelRevolutions == 0) {
            return;
        }
        addValue(data.cumulativeWheelRevolutions, data.timestamp);
    }
}
