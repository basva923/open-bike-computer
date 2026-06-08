package com.openbikecomputer.model;

/**
 * A single point of a loaded GPX route. Ported from {@code RoutePoint} in
 * {@code navigation.service.ts}.
 */
public class RoutePoint {
    public final double latitude;
    public final double longitude;
    public final double altitude;

    public RoutePoint(double latitude, double longitude, double altitude) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.altitude = altitude;
    }
}
