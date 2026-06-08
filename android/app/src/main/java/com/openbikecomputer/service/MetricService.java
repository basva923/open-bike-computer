package com.openbikecomputer.service;

import com.openbikecomputer.model.AltitudeMetric;
import com.openbikecomputer.model.BearingMetric;
import com.openbikecomputer.model.CadenceMetric;
import com.openbikecomputer.model.CurrentTimeMetric;
import com.openbikecomputer.model.DistanceMetric;
import com.openbikecomputer.model.ElapsedTimeMetric;
import com.openbikecomputer.model.GradeMetric;
import com.openbikecomputer.model.HeartRateMetric;
import com.openbikecomputer.model.LapCounterMetric;
import com.openbikecomputer.model.LatitudeMetric;
import com.openbikecomputer.model.LongitudeMetric;
import com.openbikecomputer.model.Metric;
import com.openbikecomputer.model.MetricType;
import com.openbikecomputer.model.PowerBalenceMetric;
import com.openbikecomputer.model.PowerMetric;
import com.openbikecomputer.model.SpeedMetric;
import com.openbikecomputer.model.TemperatureMetric;
import com.openbikecomputer.model.VerticalSpeedMetric;
import com.openbikecomputer.model.WheelRotationsMetric;
import com.openbikecomputer.util.UnitToString;

import java.util.ArrayList;
import java.util.List;

/**
 * Owns the full set of {@link Metric}s and the lap timeline.
 * Ported from {@code metric.service.ts}.
 */
public class MetricService implements IMetricService {

    private final ILocationService locationService;
    private final IHeartRateSensorService heartRateSensorService;
    private final IPowerMeterService powerMeterService;
    private final ISpeedSensorService speedSensorService;

    private final List<Metric> metrics = new ArrayList<>();
    private boolean running = false;
    /** Lap start times as epoch milliseconds. */
    private final List<Long> lapStartTimes = new ArrayList<>();

    public MetricService(ILocationService locationService,
                         IHeartRateSensorService heartRateSensorService,
                         IPowerMeterService powerMeterService,
                         ISpeedSensorService speedSensorService) {
        this.locationService = locationService;
        this.heartRateSensorService = heartRateSensorService;
        this.powerMeterService = powerMeterService;
        this.speedSensorService = speedSensorService;

        metrics.add(new AltitudeMetric(this));
        metrics.add(new VerticalSpeedMetric(this));
        metrics.add(new TemperatureMetric(this));
        metrics.add(new SpeedMetric(this));
        metrics.add(new PowerMetric(this));
        metrics.add(new LongitudeMetric(this));
        metrics.add(new LatitudeMetric(this));
        metrics.add(new HeartRateMetric(this));
        metrics.add(new GradeMetric(this));
        metrics.add(new DistanceMetric(this));
        metrics.add(new CadenceMetric(this));
        metrics.add(new PowerBalenceMetric(this));
        metrics.add(new WheelRotationsMetric(this));
        metrics.add(new BearingMetric(this));
        metrics.add(new LapCounterMetric(this));
        metrics.add(new CurrentTimeMetric(this));
        metrics.add(new ElapsedTimeMetric(this));
    }

    public void newLap() {
        lapStartTimes.add(System.currentTimeMillis());
        for (Metric metric : metrics) {
            metric.newLap();
        }
    }

    public int getNumberOfLaps() {
        return lapStartTimes.size();
    }

    public Long getLapStartTime(int lapIndex) {
        if (lapIndex < 0 || lapIndex >= lapStartTimes.size()) {
            throw new IllegalArgumentException("Lap index " + lapIndex
                    + " is out of bounds. Total laps: " + lapStartTimes.size());
        }
        return lapStartTimes.get(lapIndex);
    }

    public String displayLapDuration(int lapIndex) {
        if (lapIndex < 0 || lapIndex >= lapStartTimes.size()) {
            throw new IllegalArgumentException("Lap index " + lapIndex
                    + " is out of bounds. Total laps: " + lapStartTimes.size());
        }
        long startTime = lapStartTimes.get(lapIndex);
        long endTime = lapIndex < lapStartTimes.size() - 1
                ? lapStartTimes.get(lapIndex + 1) : System.currentTimeMillis();
        double duration = (endTime - startTime) / 1000.0;
        return UnitToString.secondsToTime(duration);
    }

    public void startLogging() {
        if (running) {
            return;
        }
        running = true;
        for (Metric metric : metrics) {
            metric.startLogging();
        }
        if (lapStartTimes.isEmpty()) {
            lapStartTimes.add(System.currentTimeMillis());
        }
    }

    public void stopLogging() {
        if (!running) {
            return;
        }
        running = false;
        for (Metric metric : metrics) {
            metric.stopLogging();
        }
    }

    public boolean isRunning() {
        return running;
    }

    @Override
    public ILocationService getLocationService() {
        return locationService;
    }

    @Override
    public IHeartRateSensorService getHeartRateSensorService() {
        return heartRateSensorService;
    }

    @Override
    public IPowerMeterService getPowerMeterService() {
        return powerMeterService;
    }

    @Override
    public ISpeedSensorService getSpeedSensorService() {
        return speedSensorService;
    }

    public Metric getByName(String name) {
        for (Metric metric : metrics) {
            if (metric.getName().equals(name)) {
                return metric;
            }
        }
        return null;
    }

    public List<String> getNames() {
        List<String> names = new ArrayList<>();
        for (Metric metric : metrics) {
            names.add(metric.getName());
        }
        return names;
    }

    public Metric getByMetricType(MetricType metricType) {
        for (Metric metric : metrics) {
            if (metric.getType() == metricType) {
                return metric;
            }
        }
        throw new IllegalArgumentException("Metric with type " + metricType + " not found");
    }
}
