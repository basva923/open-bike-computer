package com.openbikecomputer.model;

import com.openbikecomputer.service.IMetricService;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class BearingMetric extends Metric {
    private ScheduledExecutorService executorService;
    private boolean started = false;

    public BearingMetric(IMetricService metricService) {
        super(MetricType.BEARING, "Bearing", "\u00b0", metricService, "\u00b0");
    }

    @Override
    public void startLogging() {
        if (started) {
            return;
        }
        started = true;
        executorService = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread thread = new Thread(r, "BearingMetric");
            thread.setDaemon(true);
            return thread;
        });
        executorService.scheduleAtFixedRate(this::bearingUpdateHandler, 1000, 1000, TimeUnit.MILLISECONDS);
    }

    @Override
    public void stopLogging() {
        if (executorService != null) {
            executorService.shutdownNow();
            executorService = null;
        }
        started = false;
    }

    public void bearingUpdateHandler() {
        double bearing = metricService.getLocationService().getBearingForHorizontalPhone();
        addValue(bearing, System.currentTimeMillis());
    }
}
