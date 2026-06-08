package com.openbikecomputer.model;

import com.openbikecomputer.service.IMetricService;
import com.openbikecomputer.service.OnLocationUpdate;
import com.openbikecomputer.util.Util;

public class DistanceMetric extends Metric implements OnLocationUpdate {
    private LocationSample lastLocation = null;
    public double totalDistance = 0;

    public DistanceMetric(IMetricService metricService) {
        super(MetricType.DISTANCE, "Distance", "m", metricService, "km", 2);
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
        if (lastLocation != null) {
            double distance = Util.haversineDistanceBetweenPoints(
                    lastLocation.latitude,
                    lastLocation.longitude,
                    sample.latitude,
                    sample.longitude
            );
            totalDistance += distance;
            addValue(totalDistance, sample.timestamp);
        } else {
            addValue(totalDistance, sample.timestamp);
        }
        lastLocation = sample;
    }
}
