package com.openbikecomputer.model;

/**
 * Immutable snapshot of a GPS fix, mirroring the browser's
 * {@code GeolocationCoordinates} + timestamp used in the Angular app.
 * {@code latitude}/{@code longitude} are always present; the remaining
 * fields may be {@code null} when the platform does not provide them.
 */
public class LocationSample {
    public final double latitude;
    public final double longitude;
    public final Double altitude;
    public final Double accuracy;
    public final Double altitudeAccuracy;
    public final Double heading;
    public final Double speed;
    /** Epoch milliseconds. */
    public final long timestamp;

    public LocationSample(double latitude, double longitude, Double altitude,
                          Double accuracy, Double altitudeAccuracy,
                          Double heading, Double speed, long timestamp) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.altitude = altitude;
        this.accuracy = accuracy;
        this.altitudeAccuracy = altitudeAccuracy;
        this.heading = heading;
        this.speed = speed;
        this.timestamp = timestamp;
    }
}
