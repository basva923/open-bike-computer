package com.openbikecomputer.model;

import com.openbikecomputer.service.IMetricService;
import com.openbikecomputer.util.UnitToString;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class ElapsedTimeMetric extends Metric {
    private ScheduledExecutorService executorService;
    private Long startTime = null;
    private boolean started = false;

    public ElapsedTimeMetric(IMetricService metricService) {
        super(MetricType.ELAPSED_TIME, "Elapsed Time", "s", metricService, "s", 0);
    }

    @Override
    public void startLogging() {
        if (started) {
            return;
        }
        if (startTime == null) {
            startTime = System.currentTimeMillis();
        }
        started = true;
        executorService = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread thread = new Thread(r, "ElapsedTimeMetric");
            thread.setDaemon(true);
            return thread;
        });
        executorService.scheduleAtFixedRate(() -> {
            long now = System.currentTimeMillis();
            double elapsedSeconds = Math.floor((now - startTime) / 1000.0);
            addValue(elapsedSeconds, now);
        }, 1000, 1000, TimeUnit.MILLISECONDS);
    }

    @Override
    public void stopLogging() {
        if (executorService != null) {
            executorService.shutdownNow();
            executorService = null;
        }
        started = false;
    }

    @Override
    protected String displayValue(Double value, boolean includeUnit) {
        if (value == null) {
            return "---";
        }
        return UnitToString.secondsToTime(value);
    }
}
