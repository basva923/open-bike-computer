package com.openbikecomputer.model;

import com.openbikecomputer.service.IMetricService;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class GradeMetric extends Metric {
    private double neutralGrade = 0;
    private ScheduledExecutorService executorService;
    private boolean started = false;

    public GradeMetric(IMetricService metricService) {
        super(MetricType.GRADE, "Grade", "%", metricService);
    }

    @Override
    public void startLogging() {
        if (started) {
            return;
        }
        started = true;
        executorService = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread thread = new Thread(r, "GradeMetric");
            thread.setDaemon(true);
            return thread;
        });
        executorService.scheduleAtFixedRate(() -> {
            long now = System.currentTimeMillis();
            double phoneGrade = metricService.getLocationService().getGradeForHorizontalPhone();
            addValue(phoneGrade - neutralGrade, now);
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

    public void calibrateGrade() {
        neutralGrade = metricService.getLocationService().getGradeForHorizontalPhone();
    }
}
