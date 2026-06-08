package com.openbikecomputer.util;

/**
 * Minimal unit conversion supporting the unit pairs actually used by the
 * metrics. Ported from {@code unit-conversion.ts} (which delegated to the
 * {@code convert} npm package for the long tail of units).
 */
public final class UnitConversion {

    private UnitConversion() {
    }

    public static double convert(double value, String fromUnit, String toUnit) {
        if (fromUnit.equals(toUnit)) {
            return value;
        }

        if (fromUnit.equals("m/s") && toUnit.equals("km/h")) {
            return value * 3.6;
        }

        if (fromUnit.equals("rps") && toUnit.equals("rpm")) {
            return value * 60.0;
        }

        if (fromUnit.equals("m") && toUnit.equals("km")) {
            return value / 1000.0;
        }

        if (fromUnit.equals("km") && toUnit.equals("m")) {
            return value * 1000.0;
        }

        // Temperature: Kelvin to Celsius (the app stores Kelvin and displays Celsius).
        if (fromUnit.equals("\u00b0K") && toUnit.equals("\u00b0C")) {
            return value - 273.15;
        }
        if (fromUnit.equals("\u00b0C") && toUnit.equals("\u00b0K")) {
            return value + 273.15;
        }

        throw new IllegalArgumentException(
                "Unsupported unit conversion: " + fromUnit + " -> " + toUnit);
    }
}
