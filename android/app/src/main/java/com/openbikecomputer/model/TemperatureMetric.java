package com.openbikecomputer.model;

import com.openbikecomputer.service.IMetricService;

public class TemperatureMetric extends Metric {
    public TemperatureMetric(IMetricService metricService) {
        super(MetricType.TEMPERATURE, "Temperature", "\u00b0K", metricService, "\u00b0C");
    }

    @Override
    public void startLogging() {
    }

    @Override
    public void stopLogging() {
    }
}
