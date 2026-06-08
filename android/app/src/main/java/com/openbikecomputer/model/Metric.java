package com.openbikecomputer.model;

import com.openbikecomputer.service.IMetricService;
import com.openbikecomputer.util.UnitConversion;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Base class for all metrics. Stores a time series of values and exposes
 * averaging / formatting helpers. Ported from {@code Metric.ts}.
 *
 * <p>Timestamps are epoch milliseconds (the Angular app used {@code Date}).</p>
 */
public abstract class Metric {
    protected final MetricType type;
    protected final String name;
    protected final String siUnit;
    protected final String preferredUnit;
    protected final int preferredPrecision;

    protected final List<Double> values = new ArrayList<>();
    protected final List<Long> timestamps = new ArrayList<>();
    /** Starting index of each lap. */
    protected final List<Integer> laps = new ArrayList<>();

    protected final IMetricService metricService;

    protected Metric(MetricType type, String name, String siUnit, IMetricService metricService) {
        this(type, name, siUnit, metricService, siUnit, 0);
    }

    protected Metric(MetricType type, String name, String siUnit, IMetricService metricService,
                     String preferredUnit) {
        this(type, name, siUnit, metricService, preferredUnit, 0);
    }

    protected Metric(MetricType type, String name, String siUnit, IMetricService metricService,
                     String preferredUnit, int preferredPrecision) {
        this.type = type;
        this.name = name;
        this.siUnit = siUnit;
        this.metricService = metricService;
        this.preferredUnit = preferredUnit;
        this.preferredPrecision = preferredPrecision;
        this.laps.add(0);
    }

    /** Start logging the metric (subscribe to sensors / timers). */
    public abstract void startLogging();

    /** Stop logging the metric. */
    public abstract void stopLogging();

    public void newLap() {
        laps.add(values.size());
    }

    public void addValue(double value, long timestamp) {
        values.add(value);
        timestamps.add(timestamp);
    }

    public List<Double> getValues() {
        return values;
    }

    public List<Long> getTimestamps() {
        return timestamps;
    }

    public String getName() {
        return name;
    }

    public String getPreferredUnit() {
        return preferredUnit;
    }

    public MetricType getType() {
        return type;
    }

    public Double getLastValue() {
        if (!values.isEmpty()) {
            return values.get(values.size() - 1);
        }
        return null;
    }

    public Double get3sAverage() {
        return average(getValuesUntil(3));
    }

    public Double get30sAverage() {
        return average(getValuesUntil(30));
    }

    public Double getAverage() {
        return average(values);
    }

    public Double getMax() {
        if (values.isEmpty()) {
            return null;
        }
        double max = Double.NEGATIVE_INFINITY;
        for (double v : values) {
            if (v > max) {
                max = v;
            }
        }
        return max;
    }

    public Double getAverageForLap(Integer lapIndex) {
        if (lapIndex == null) {
            lapIndex = laps.size() - 1;
        }
        if (lapIndex < 0 || lapIndex >= laps.size()) {
            throw new IllegalArgumentException("Invalid lap index: " + lapIndex);
        }
        int start = laps.get(lapIndex);
        int end = lapIndex + 1 < laps.size() ? laps.get(lapIndex + 1) : values.size();
        if (start >= end) {
            return null;
        }
        return average(values.subList(start, end));
    }

    public String displayLastValue(boolean includeUnit) {
        return displayValue(getLastValue(), includeUnit);
    }

    public String displayLastValue() {
        return displayLastValue(true);
    }

    public String display3sAverage(boolean includeUnit) {
        return displayValue(get3sAverage(), includeUnit);
    }

    public String display3sAverage() {
        return display3sAverage(true);
    }

    public String display30sAverage(boolean includeUnit) {
        return displayValue(get30sAverage(), includeUnit);
    }

    public String display30sAverage() {
        return display30sAverage(true);
    }

    public String displayAverage(boolean includeUnit) {
        return displayValue(getAverage(), includeUnit);
    }

    public String displayMax(boolean includeUnit) {
        return displayValue(getMax(), includeUnit);
    }

    public String displayAverageForLap(Integer lapIndex, boolean includeUnit) {
        return displayValue(getAverageForLap(lapIndex), includeUnit);
    }

    public String displayAverageForLap(Integer lapIndex) {
        return displayAverageForLap(lapIndex, true);
    }

    public String displayAverageForLap() {
        return displayAverageForLap(null, true);
    }

    public Long getLastTimestamp() {
        if (!timestamps.isEmpty()) {
            return timestamps.get(timestamps.size() - 1);
        }
        return null;
    }

    /** Values logged within the last {@code secondsAgo} seconds. */
    protected List<Double> getValuesUntil(double secondsAgo) {
        long threshold = System.currentTimeMillis() - (long) (secondsAgo * 1000);
        List<Double> result = new ArrayList<>();
        for (int i = 0; i < values.size(); i++) {
            if (timestamps.get(i) >= threshold) {
                result.add(values.get(i));
            }
        }
        return result;
    }

    private static Double average(List<Double> input) {
        if (input == null || input.isEmpty()) {
            return null;
        }
        double sum = 0;
        for (double v : input) {
            sum += v;
        }
        return sum / input.size();
    }

    protected String displayValue(Double value, boolean includeUnit) {
        if (value == null) {
            return "00.00";
        }
        double valueConverted = value;
        if (!siUnit.equals(preferredUnit)) {
            valueConverted = UnitConversion.convert(value, siUnit, preferredUnit);
        }
        String formatted = String.format(Locale.US, "%." + preferredPrecision + "f", valueConverted);
        if (includeUnit) {
            return formatted + " " + preferredUnit;
        }
        return formatted;
    }
}
