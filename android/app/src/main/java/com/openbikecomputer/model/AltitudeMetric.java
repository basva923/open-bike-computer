package com.openbikecomputer.model;

import com.openbikecomputer.service.IMetricService;
import com.openbikecomputer.service.OnLocationUpdate;

public class AltitudeMetric extends Metric implements OnLocationUpdate {
    public AltitudeMetric(IMetricService metricService) {
        super(MetricType.ALTITUDE, "Altitude", "m", metricService);
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
        if (sample.altitude != null) {
            addValue(sample.altitude, sample.timestamp);
        }
    }
}
