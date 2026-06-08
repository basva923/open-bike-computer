package com.openbikecomputer.util;

import java.util.Locale;

/**
 * Human-readable formatting helpers. Ported from {@code unit-to-string.ts}.
 */
public final class UnitToString {

    private UnitToString() {
    }

    public static String metersToString(double meters) {
        return String.format(Locale.US, "%.0f", meters) + "m";
    }

    public static String milisecondsToTime(long ms) {
        long seconds = (ms / 1000) % 60;
        long minutes = (ms / (1000 * 60)) % 60;
        long hours = (ms / (1000L * 60 * 60)) % 24;
        long days = ms / (1000L * 60 * 60 * 24);

        StringBuilder sb = new StringBuilder();
        if (days > 0) {
            sb.append(days).append("d ");
        }
        if (hours > 0 || days > 0) {
            sb.append(pad(hours)).append(':');
        }
        sb.append(pad(minutes)).append(':').append(pad(seconds));
        return sb.toString();
    }

    public static String secondsToTime(double secondsTotal) {
        long total = (long) Math.floor(secondsTotal);
        long minutes = total / 60;
        long remainingSeconds = total % 60;
        long hours = minutes / 60;
        long remainingMinutes = minutes % 60;
        long days = hours / 24;
        long remainingHours = hours % 24;

        StringBuilder sb = new StringBuilder();
        if (days > 0) {
            sb.append(days).append("d ");
        }
        if (remainingHours > 0 || days > 0) {
            sb.append(pad(remainingHours)).append(':');
        }
        sb.append(pad(remainingMinutes)).append(':').append(pad(remainingSeconds));
        return sb.toString();
    }

    public static String metersPerSecondToKnots(double mps) {
        return String.format(Locale.US, "%.1f", mps * 1.94384449) + "kt";
    }

    public static String secondsToString(double seconds) {
        return String.format(Locale.US, "%.0f", seconds) + "s";
    }

    public static String metersToNauticalMiles(double m) {
        return String.format(Locale.US, "%.2f", m / 1852.0) + "nm";
    }

    public static String degreesToString(double degrees) {
        return String.format(Locale.US, "%.0f", degrees) + "\u00b0";
    }

    private static String pad(long num) {
        return num < 10 ? "0" + num : Long.toString(num);
    }
}
