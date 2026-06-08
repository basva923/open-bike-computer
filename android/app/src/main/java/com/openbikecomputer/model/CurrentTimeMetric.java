package com.openbikecomputer.model;

import com.openbikecomputer.service.IMetricService;

import java.util.Calendar;
import java.util.Locale;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class CurrentTimeMetric extends Metric {
    private ScheduledExecutorService executorService;
    private boolean started = false;

    public CurrentTimeMetric(IMetricService metricService) {
        super(MetricType.CURRENT_TIME, "Current Time", "s", metricService, "s", 0);
    }

    @Override
    public void startLogging() {
        if (started) {
            return;
        }
        started = true;
        executorService = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread thread = new Thread(r, "CurrentTimeMetric");
            thread.setDaemon(true);
            return thread;
        });
        executorService.scheduleAtFixedRate(() -> {
            long now = System.currentTimeMillis();
            addValue(now / 1000.0, now);
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
        Calendar date = Calendar.getInstance();
        date.setTimeInMillis((long) (value * 1000));
        return String.format(Locale.US, "%02d:%02d",
                date.get(Calendar.HOUR_OF_DAY),
                date.get(Calendar.MINUTE));
    }
}
