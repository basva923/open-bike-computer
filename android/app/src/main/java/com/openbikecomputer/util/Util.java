package com.openbikecomputer.util;

/**
 * Geographic and angle helper functions.
 * Ported from the Angular app's {@code util.ts}.
 */
public final class Util {
    private static final double EARTH_RADIUS_M = 6371.0 * 1000.0;

    private Util() {
    }

    /** Calculate initial bearing between two points, in radians. */
    public static double bearing(double lat1, double lon1, double lat2, double lon2) {
        double lat1Rad = toRadians(lat1);
        double lat2Rad = toRadians(lat2);
        double dLon = toRadians(lon2 - lon1);

        double y = Math.sin(dLon) * Math.cos(lat2Rad);
        double x = Math.cos(lat1Rad) * Math.sin(lat2Rad)
                - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

        return Math.atan2(y, x);
    }

    /**
     * Calculate the distance between point P and the great circle defined by
     * points A and B, in meters.
     */
    public static double distanceToLine(double latA, double lonA,
                                        double latB, double lonB,
                                        double latP, double lonP) {
        double d13 = haversineDistanceBetweenPoints(latA, lonA, latP, lonP);

        double theta13 = bearing(latA, lonA, latP, lonP);
        double theta12 = bearing(latA, lonA, latB, lonB);

        double dXt = Math.asin(Math.sin(d13 / EARTH_RADIUS_M) * Math.sin(theta13 - theta12)) * EARTH_RADIUS_M;

        return Math.abs(dXt);
    }

    /** Haversine distance between two coordinates, in meters. */
    public static double haversineDistanceBetweenPoints(double lat1, double lon1,
                                                        double lat2, double lon2) {
        double dLat = toRadians(lat2 - lat1);
        double dLon = toRadians(lon2 - lon1);
        double lat1Rad = toRadians(lat1);
        double lat2Rad = toRadians(lat2);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(lat1Rad) * Math.cos(lat2Rad)
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_M * c;
    }

    public static double normaliseDegrees(double degrees) {
        return ((degrees % 360) + 360) % 360;
    }

    public static double toRadians(double degrees) {
        return (degrees * Math.PI) / 180.0;
    }

    public static double toDegrees(double radians) {
        return normaliseDegrees((radians * 180.0) / Math.PI);
    }

    /**
     * Difference between two angles in degrees, normalised to [-180, 180).
     */
    public static double angleDiff(double degrees1, double degrees2) {
        degrees1 = normaliseDegrees(degrees1);
        degrees2 = normaliseDegrees(degrees2);

        double diff = degrees2 - degrees1;

        if (diff >= 180) {
            return diff - 360;
        } else if (diff < -180) {
            return diff + 360;
        }
        return diff;
    }
}
