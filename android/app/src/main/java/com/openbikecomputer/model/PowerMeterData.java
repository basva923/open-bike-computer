package com.openbikecomputer.model;

/**
 * Parsed Bluetooth cycling-power measurement. Ported from {@code PowerMeterData.ts}.
 */
public class PowerMeterData {
    /** Epoch milliseconds. */
    public long timestamp;
    public double power;

    /**
     * If the sensor provides the power balance referenced to the left pedal,
     * the power balance is {@code [LeftPower/(LeftPower + RightPower)]*100} in percent.
     */
    public Double balance;
    public Double accumulatedTorque;
    public Long cumulativeCrankRevolutions;
    /** Last crank event time, Uint16 in 1/1024 second. */
    public Long lastCrankEventTimestamp;

    public PowerMeterData(long timestamp, double power) {
        this.timestamp = timestamp;
        this.power = power;
    }

    public Double diffCrankRotations(PowerMeterData previous) {
        return diff(cumulativeCrankRevolutions, previous.cumulativeCrankRevolutions, 0xFFFFFFFFL);
    }

    public Double diffCrankTimeInSeconds(PowerMeterData previous) {
        Double d = diff(lastCrankEventTimestamp, previous.lastCrankEventTimestamp, 0xFFFFFFFFL);
        if (d == null) {
            return null;
        }
        return d / 1024.0;
    }

    public double getTotalPower() {
        if (balance == null || balance == 0.0) {
            return power * 2;
        }
        return power;
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
