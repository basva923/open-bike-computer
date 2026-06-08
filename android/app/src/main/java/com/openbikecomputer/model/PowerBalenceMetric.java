package com.openbikecomputer.model;

import com.openbikecomputer.service.IMetricService;
import com.openbikecomputer.service.OnPowerData;

public class PowerBalenceMetric extends Metric implements OnPowerData {
    public PowerBalenceMetric(IMetricService metricService) {
        super(MetricType.POWER_BALENCE, "Power Balence", "%", metricService, "%", 0);
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
        if (data.balance != null && data.balance != 0) {
            addValue(data.balance, data.timestamp);
        }
    }
}
