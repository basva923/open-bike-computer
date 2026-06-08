package com.openbikecomputer.model;

/**
 * Parsed Bluetooth heart-rate measurement. Ported from {@code HeartReateData.ts}.
 */
public class HeartRateData {
    /** Epoch milliseconds. */
    public long timestamp;
    public int heartRate;
    public Boolean contactDetected;
    public Integer energyExpended;
    public int[] rrIntervals;

    public HeartRateData(long timestamp, int heartRate) {
        this.timestamp = timestamp;
        this.heartRate = heartRate;
    }

    public HeartRateData(long timestamp, int heartRate, Boolean contactDetected,
                         Integer energyExpended, int[] rrIntervals) {
        this.timestamp = timestamp;
        this.heartRate = heartRate;
        this.contactDetected = contactDetected;
        this.energyExpended = energyExpended;
        this.rrIntervals = rrIntervals;
    }
}
