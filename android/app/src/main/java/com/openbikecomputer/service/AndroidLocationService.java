package com.openbikecomputer.service;

import android.annotation.SuppressLint;
import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;

import com.openbikecomputer.model.LocationSample;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class AndroidLocationService implements ILocationService {
    private static final int HEADING_THRESHOLD_DEG = 5;
    private static final int MAX_SKIP_INTERVAL_MS = 5000;
    private static final int MAX_LOCATIONS = 10000;
    private static final int LOCATIONS_TRIM_THRESHOLD = 11000;
    private static final int MIN_LOCATIONS_FOR_BASELINE = 3;

    private final CopyOnWriteArrayList<OnLocationUpdate> listeners = new CopyOnWriteArrayList<>();
    private final List<LocationSample> locations = new ArrayList<>();
    private final Object locationsLock = new Object();

    private Double lastDispatchedHeading = null;
    private long lastDispatchedTime = 0;

    private double alpha = 0;
    private double beta = 0;
    private double gamma = 0;
    private boolean reversedPhone = false;

    public AndroidLocationService(Context context) {
        Context appContext = context.getApplicationContext();
        startLocationUpdates(appContext);
        startOrientationUpdates(appContext);
    }

    @SuppressLint("MissingPermission")
    private void startLocationUpdates(Context context) {
        LocationManager locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
        if (locationManager == null) {
            return;
        }
        try {
            locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 1000L, 0f, new LocationListener() {
                @Override
                public void onLocationChanged(Location location) {
                    handleLocation(location);
                }

                @Override
                public void onStatusChanged(String provider, int status, Bundle extras) {
                }

                @Override
                public void onProviderEnabled(String provider) {
                }

                @Override
                public void onProviderDisabled(String provider) {
                }
            });
        } catch (SecurityException | IllegalArgumentException ignored) {
        }
    }

    private void startOrientationUpdates(Context context) {
        SensorManager sensorManager = (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);
        if (sensorManager == null) {
            return;
        }
        Sensor rotationVector = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
        if (rotationVector == null) {
            return;
        }
        sensorManager.registerListener(new SensorEventListener() {
            @Override
            public void onSensorChanged(SensorEvent event) {
                float[] rotationMatrix = new float[9];
                float[] orientation = new float[3];
                SensorManager.getRotationMatrixFromVector(rotationMatrix, event.values);
                SensorManager.getOrientation(rotationMatrix, orientation);
                alpha = normalizeDegrees(Math.toDegrees(orientation[0]));
                beta = Math.toDegrees(orientation[1]);
                gamma = Math.toDegrees(orientation[2]);
            }

            @Override
            public void onAccuracyChanged(Sensor sensor, int accuracy) {
            }
        }, rotationVector, SensorManager.SENSOR_DELAY_UI);
    }

    private void handleLocation(Location location) {
        LocationSample sample = toSample(location);
        if (!shouldDispatchUpdate(sample)) {
            return;
        }

        synchronized (locationsLock) {
            locations.add(sample);
            if (locations.size() > LOCATIONS_TRIM_THRESHOLD) {
                List<LocationSample> tail = new ArrayList<>(locations.subList(locations.size() - MAX_LOCATIONS, locations.size()));
                locations.clear();
                locations.addAll(tail);
            }
        }

        for (OnLocationUpdate listener : listeners) {
            listener.onLocation(sample);
        }
        lastDispatchedHeading = sample.heading;
        lastDispatchedTime = System.currentTimeMillis();
    }

    private LocationSample toSample(Location location) {
        Double altitude = location.hasAltitude() ? location.getAltitude() : null;
        Double accuracy = location.hasAccuracy() ? (double) location.getAccuracy() : null;
        Double altitudeAccuracy = null;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && location.hasVerticalAccuracy()) {
            altitudeAccuracy = (double) location.getVerticalAccuracyMeters();
        }
        Double heading = location.hasBearing() ? (double) location.getBearing() : null;
        Double speed = location.hasSpeed() ? (double) location.getSpeed() : null;
        return new LocationSample(location.getLatitude(), location.getLongitude(), altitude, accuracy,
                altitudeAccuracy, heading, speed, location.getTime());
    }

    private boolean shouldDispatchUpdate(LocationSample sample) {
        long now = System.currentTimeMillis();

        synchronized (locationsLock) {
            if (locations.size() < MIN_LOCATIONS_FOR_BASELINE) {
                return true;
            }
        }

        if (now - lastDispatchedTime >= MAX_SKIP_INTERVAL_MS) {
            return true;
        }

        if (sample.heading != null && lastDispatchedHeading != null) {
            double headingDiff = Math.abs(sample.heading - lastDispatchedHeading);
            double normalizedDiff = headingDiff > 180 ? 360 - headingDiff : headingDiff;
            if (normalizedDiff < HEADING_THRESHOLD_DEG) {
                return false;
            }
        }

        return true;
    }

    private static double normalizeDegrees(double degrees) {
        double normalized = degrees % 360.0;
        return normalized < 0 ? normalized + 360.0 : normalized;
    }

    private LocationSample getLastSample() {
        synchronized (locationsLock) {
            return locations.isEmpty() ? null : locations.get(locations.size() - 1);
        }
    }

    @Override
    public void subscribeForLocation(OnLocationUpdate listener) {
        listeners.addIfAbsent(listener);
    }

    @Override
    public void unsubscribeForLocation(OnLocationUpdate listener) {
        listeners.remove(listener);
    }

    @Override
    public double getGradeForHorizontalPhone() {
        return beta;
    }

    @Override
    public double getBearingForHorizontalPhone() {
        return 360 - alpha;
    }

    @Override
    public double getBearingForVerticalPhone() {
        double alphaRad = alpha * (Math.PI / 180);
        double betaRad = beta * (Math.PI / 180);
        double gammaRad = gamma * (Math.PI / 180);

        double cA = Math.cos(alphaRad);
        double sA = Math.sin(alphaRad);
        double cB = Math.cos(betaRad);
        double sB = Math.sin(betaRad);
        double cG = Math.cos(gammaRad);
        double sG = Math.sin(gammaRad);

        double rA = -cA * sG - sA * sB * cG;
        double rB = -sA * sG + cA * sB * cG;
        double rC = -cB * cG;

        double compassHeading = Math.atan(rA / rB);
        if (rB < 0) {
            compassHeading += Math.PI;
        } else if (rA < 0) {
            compassHeading += 2 * Math.PI;
        }

        if (reversedPhone) {
            compassHeading += compassHeading >= Math.PI ? -Math.PI : Math.PI;
        }
        return compassHeading * 180 / Math.PI;
    }

    @Override
    public Double getCurLatitude() {
        LocationSample sample = getLastSample();
        return sample == null ? null : sample.latitude;
    }

    @Override
    public Double getCurLongitude() {
        LocationSample sample = getLastSample();
        return sample == null ? null : sample.longitude;
    }

    @Override
    public Double getCurAltitude() {
        LocationSample sample = getLastSample();
        return sample == null ? null : sample.altitude;
    }

    @Override
    public Double getCurAccuracy() {
        LocationSample sample = getLastSample();
        return sample == null ? null : sample.accuracy;
    }

    @Override
    public Double getCurAltitudeAccuracy() {
        LocationSample sample = getLastSample();
        return sample == null ? null : sample.altitudeAccuracy;
    }

    @Override
    public Double getCurHeading() {
        LocationSample sample = getLastSample();
        return sample == null ? null : sample.heading;
    }

    @Override
    public Double getCurSpeed() {
        LocationSample sample = getLastSample();
        return sample == null ? null : sample.speed;
    }

    @Override
    public Long getCurTimestamp() {
        LocationSample sample = getLastSample();
        return sample == null ? null : sample.timestamp;
    }

    @Override
    public Double getMaxSpeed() {
        double maxSpeed = 0;
        synchronized (locationsLock) {
            for (int i = 1; i < locations.size(); i++) {
                Double speed = locations.get(i).speed;
                if (speed != null && speed > maxSpeed) {
                    maxSpeed = speed;
                }
            }
        }
        return maxSpeed;
    }

    @Override
    public double getAvgSpeed() {
        synchronized (locationsLock) {
            if (locations.isEmpty()) {
                return 0;
            }
            double sumSpeed = 0;
            for (int i = 1; i < locations.size(); i++) {
                Double speed = locations.get(i).speed;
                sumSpeed += speed == null ? 0 : speed;
            }
            return sumSpeed / locations.size();
        }
    }

    @Override
    public List<LocationSample> getCoordinatesLog() {
        synchronized (locationsLock) {
            return new ArrayList<>(locations);
        }
    }

    @Override
    public boolean isPhonePointingForward() {
        return !reversedPhone;
    }

    @Override
    public void setPhonePointingForward(boolean pointingForward) {
        reversedPhone = !pointingForward;
    }
}
