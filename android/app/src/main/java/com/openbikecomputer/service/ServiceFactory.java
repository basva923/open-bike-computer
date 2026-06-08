package com.openbikecomputer.service;

import android.content.Context;

/**
 * Lazily constructs and shares the singleton services. Ported from
 * {@code ServiceFactory.ts}. Call {@link #init(Context)} once (from the
 * Activity/Application) before requesting any service.
 */
public final class ServiceFactory {

    private static Context appContext;

    private static ILocationService locationService;
    private static IHeartRateSensorService heartRateSensorService;
    private static IPowerMeterService powerMeterService;
    private static ISpeedSensorService speedSensorService;
    private static NavigationService navigationService;
    private static TrainingService trainingService;
    private static MetricService metricService;

    private ServiceFactory() {
    }

    public static synchronized void init(Context context) {
        if (appContext == null) {
            appContext = context.getApplicationContext();
        }
    }

    private static Context requireContext() {
        if (appContext == null) {
            throw new IllegalStateException("ServiceFactory.init(Context) must be called first");
        }
        return appContext;
    }

    public static synchronized ILocationService getLocationService() {
        if (locationService == null) {
            locationService = new AndroidLocationService(requireContext());
        }
        return locationService;
    }

    public static synchronized IHeartRateSensorService getHeartRateSensorService() {
        if (heartRateSensorService == null) {
            heartRateSensorService = new AndroidHeartRateSensorService(requireContext());
        }
        return heartRateSensorService;
    }

    public static synchronized IPowerMeterService getPowerMeterService() {
        if (powerMeterService == null) {
            powerMeterService = new AndroidPowerMeterService(requireContext());
        }
        return powerMeterService;
    }

    public static synchronized ISpeedSensorService getSpeedSensorService() {
        if (speedSensorService == null) {
            speedSensorService = new AndroidSpeedSensorService(requireContext());
        }
        return speedSensorService;
    }

    public static synchronized NavigationService getNavigationService() {
        if (navigationService == null) {
            navigationService = new NavigationService();
        }
        return navigationService;
    }

    public static synchronized MetricService getMetricService() {
        if (metricService == null) {
            metricService = new MetricService(
                    getLocationService(),
                    getHeartRateSensorService(),
                    getPowerMeterService(),
                    getSpeedSensorService());
        }
        return metricService;
    }

    public static synchronized TrainingService getTrainingService() {
        if (trainingService == null) {
            trainingService = new TrainingService(getMetricService());
        }
        return trainingService;
    }
}
