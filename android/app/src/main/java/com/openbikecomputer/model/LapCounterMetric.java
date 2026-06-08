package com.openbikecomputer.model;

import com.openbikecomputer.service.IMetricService;

public class LapCounterMetric extends Metric {
    public LapCounterMetric(IMetricService metricService) {
        super(MetricType.LAP_COUNTER, "Lap Counter", "laps", metricService, "laps", 0);
    }

    @Override
    public void startLogging() {
    }

    @Override
    public void stopLogging() {
    }

    @Override
    public void newLap() {
        super.newLap();
        addValue(laps.size() - 1, System.currentTimeMillis());
    }
}
