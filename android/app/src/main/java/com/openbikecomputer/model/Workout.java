package com.openbikecomputer.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * A structured workout and its steps. Ported from {@code Workout.ts}.
 */
public class Workout {

    public enum DurationType {
        TIME, DISTANCE, OPEN
    }

    public enum TargetType {
        HEART_RATE, POWER, SPEED, CADENCE, OPEN
    }

    public static class WorkoutStep {
        public final DurationType durationType;
        /** Seconds (TIME) or kilometres (DISTANCE) — matching the original app. */
        public final double durationValue;
        public final TargetType targetType;
        public final Double targetLow;
        public final Double targetHigh;
        public final String name;

        public WorkoutStep(DurationType durationType, double durationValue, TargetType targetType,
                           Double targetLow, Double targetHigh, String name) {
            this.durationType = durationType;
            this.durationValue = durationValue;
            this.targetType = targetType;
            this.targetLow = targetLow;
            this.targetHigh = targetHigh;
            this.name = name;
        }

        public String displayValue(Double value) {
            switch (targetType) {
                case OPEN:
                    return "Open";
                case POWER:
                    return value + "W";
                case HEART_RATE:
                    return value + "bpm";
                case SPEED:
                    return value + "m/s";
                case CADENCE:
                    return value + "rpm";
                default:
                    return "N/A";
            }
        }

        public String displayTargetLow() {
            return displayValue(targetLow);
        }

        public String displayTargetHigh() {
            return displayValue(targetHigh);
        }

        public String displayDuration() {
            switch (durationType) {
                case TIME: {
                    int minutes = (int) Math.floor(durationValue / 60);
                    int seconds = (int) Math.floor(durationValue % 60);
                    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
                }
                case DISTANCE:
                    return formatNumber(durationValue) + " km";
                case OPEN:
                    return "Open";
                default:
                    throw new IllegalStateException("Unknown duration type: " + durationType);
            }
        }

        /**
         * Build a step from the raw (FIT) field values, applying the same
         * relative-target resolution logic as the Angular app.
         */
        public static WorkoutStep fromRaw(String durationTypeRaw, double durationValueRaw,
                                          String targetTypeRaw,
                                          double customTargetValueLow, double customTargetValueHigh,
                                          String stepName,
                                          double powerThreshold, double heartRateThreshold) {
            DurationType durationType = parseDurationType(durationTypeRaw);
            TargetType targetType = parseTargetType(targetTypeRaw);

            Double threshold = targetType == TargetType.POWER ? powerThreshold
                    : targetType == TargetType.HEART_RATE ? heartRateThreshold : null;

            return new WorkoutStep(
                    durationType,
                    durationValueRaw / 1000.0,
                    targetType,
                    parseCustomTargetValue(targetType, customTargetValueLow, threshold),
                    parseCustomTargetValue(targetType, customTargetValueHigh, threshold),
                    stepName == null ? "" : stepName);
        }

        public static DurationType parseDurationType(String durationType) {
            if (durationType == null) {
                return DurationType.OPEN;
            }
            switch (durationType.toLowerCase(Locale.US)) {
                case "time":
                    return DurationType.TIME;
                case "distance":
                    return DurationType.DISTANCE;
                case "open":
                    return DurationType.OPEN;
                default:
                    // Unsupported duration types behave as open-ended (press lap).
                    return DurationType.OPEN;
            }
        }

        public static TargetType parseTargetType(String targetType) {
            if (targetType == null) {
                return TargetType.OPEN;
            }
            String t = targetType.toLowerCase(Locale.US);
            if (t.startsWith("power")) {
                return TargetType.POWER;
            } else if (t.startsWith("heart")) {
                return TargetType.HEART_RATE;
            } else if (t.startsWith("speed")) {
                return TargetType.SPEED;
            } else if (t.startsWith("cadence")) {
                return TargetType.CADENCE;
            }
            return TargetType.OPEN;
        }

        public static Double parseCustomTargetValue(TargetType targetType, double value, Double threshold) {
            if (value <= 0) {
                return null;
            }
            switch (targetType) {
                case POWER:
                    if (value < 1000) {
                        if (threshold == null || threshold == 0.0) {
                            throw new IllegalStateException("Relative power target not supported");
                        }
                        return threshold * value / 100.0;
                    }
                    return value - 1000;
                case HEART_RATE:
                    if (value < 100) {
                        if (threshold == null || threshold == 0.0) {
                            throw new IllegalStateException("Relative heart rate target not supported");
                        }
                        return threshold * value / 100.0;
                    }
                    return value - 100;
                case SPEED:
                    return value;
                case CADENCE:
                    return value;
                default:
                    return 0.0;
            }
        }

        private static String formatNumber(double v) {
            if (v == Math.floor(v)) {
                return Long.toString((long) v);
            }
            return Double.toString(v);
        }
    }

    public final String sport;
    public final String name;
    public final List<WorkoutStep> steps;

    public Workout(String sport, String name, List<WorkoutStep> steps) {
        this.sport = sport;
        this.name = name;
        this.steps = steps != null ? steps : new ArrayList<>();
    }
}
