package com.openbikecomputer.model;

import com.openbikecomputer.service.IMetricService;
import com.openbikecomputer.service.OnLocationUpdate;

public class LatitudeMetric extends Metric implements OnLocationUpdate {
    public LatitudeMetric(IMetricService metricService) {
        super(MetricType.LATITUDE, "Latitude", "\u00b0", metricService, "\u00b0", 5);
    }

    @Override
    public void startLogging() {
        metricService.getLocationService().subscribeForLocation(this);
    }

    @Override
    public void stopLogging() {
        metricService.getLocationService().unsubscribeForLocation(this);
    }

    @Override
    public void onLocation(LocationSample sample) {
        addValue(sample.latitude, sample.timestamp);
    }
}
