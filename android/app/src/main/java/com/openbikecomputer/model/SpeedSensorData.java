package com.openbikecomputer.model;

/**
 * Parsed Bluetooth Cycling Speed and Cadence (CSC) measurement.
 * Ported from {@code SpeedSensorData.ts}.
 */
public class SpeedSensorData {
    /** Epoch milliseconds. */
    public long timestamp;
    /** Cumulative wheel revolutions, Uint32. */
    public Long cumulativeWheelRevolutions;
    /** Cumulative crank revolutions, Uint16. */
    public Long cumulativeCrankRevolutions;
    /** Last wheel event time, Uint16 in 1/1024 second. */
    public Long lastWheelEventTime;
    /** Last crank event time, Uint16 in 1/1024 second. */
    public Long lastCrankEventTime;

    public SpeedSensorData(long timestamp) {
        this.timestamp = timestamp;
    }

    public Double diffWheelRevolutions(SpeedSensorData previous) {
        return diff(cumulativeWheelRevolutions, previous.cumulativeWheelRevolutions, 0xFFFFFFFFL);
    }

    public Double diffCrankRevolutions(SpeedSensorData previous) {
        return diff(cumulativeCrankRevolutions, previous.cumulativeCrankRevolutions, 0xFFFFL);
    }

    public Double diffWheelTimeInSeconds(SpeedSensorData previous) {
        Double d = diff(lastWheelEventTime, previous.lastWheelEventTime, 0xFFFFL);
        if (d == null) {
            return null;
        }
        return d / 1024.0;
    }

    public Double diffCrankTimeInSeconds(SpeedSensorData previous) {
        Double d = diff(lastCrankEventTime, previous.lastCrankEventTime, 0xFFFFL);
        if (d == null) {
            return null;
        }
        return d / 1024.0;
    }

    private static Double diff(Long biggest, Long smallest, long maxValue) {
        if (biggest == null || smallest == null) {
            return null;
        }
        if (biggest < smallest) {
            return (double) ((biggest + maxValue) - smallest);
        }
        return (double) (biggest - smallest);
    }
}
