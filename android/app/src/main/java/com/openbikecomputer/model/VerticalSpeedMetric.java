package com.openbikecomputer.model;

import com.openbikecomputer.service.IMetricService;
import com.openbikecomputer.service.OnLocationUpdate;

public class VerticalSpeedMetric extends Metric implements OnLocationUpdate {
    protected LocationSample lastLocation = null;

    public VerticalSpeedMetric(IMetricService metricService) {
        super(MetricType.VERTICAL_SPEED, "Vertical Speed", "m/s", metricService);
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
        Double lastAltitude = lastLocation == null ? null : lastLocation.altitude;
        Double currentAltitude = sample.altitude;
        if (lastAltitude != null && currentAltitude != null) {
            double distance = currentAltitude - lastAltitude;
            double time = (sample.timestamp - lastLocation.timestamp) / 1000.0;
            addValue(distance / time, sample.timestamp);
        } else {
            addValue(0, sample.timestamp);
        }
        lastLocation = sample;
    }
}
