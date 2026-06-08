package com.openbikecomputer.model;

import com.openbikecomputer.service.IMetricService;
import com.openbikecomputer.service.OnPowerData;

public class PowerMetric extends Metric implements OnPowerData {
    public PowerMetric(IMetricService metricService) {
        super(MetricType.POWER, "Power", "W", metricService);
    }

    @Override
    public void startLogging() {
        metricService.getPowerMeterService().subscribeForPowerData(this);
    }

    @Override
    public void stopLogging() {
        metricService.getPowerMeterService().unsubscribeForPowerData(this);
    }

    @Override
    public void onPowerData(PowerMeterData data) {
        addValue(data.getTotalPower(), data.timestamp);
    }
}
