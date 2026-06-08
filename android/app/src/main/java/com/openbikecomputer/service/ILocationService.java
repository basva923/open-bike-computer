package com.openbikecomputer.service;

import com.openbikecomputer.model.LocationSample;

import java.util.List;

/**
 * Provides GPS location and device-orientation derived values.
 * Ported from {@code ILocationService.ts} / {@code location.service.ts}.
 */
public interface ILocationService {
    void subscribeForLocation(OnLocationUpdate listener);

    void unsubscribeForLocation(OnLocationUpdate listener);

    /** Pitch of a horizontally-held phone, used as an approximation of road grade. */
    double getGradeForHorizontalPhone();

    /** Compass heading derived for a horizontally-held phone (degrees). */
    double getBearingForHorizontalPhone();

    /** Compass heading derived for a vertically-held phone (degrees). */
    double getBearingForVerticalPhone();

    Double getCurLatitude();

    Double getCurLongitude();

    Double getCurAltitude();

    Double getCurAccuracy();

    Double getCurAltitudeAccuracy();

    Double getCurHeading();

    Double getCurSpeed();

    Long getCurTimestamp();

    Double getMaxSpeed();

    double getAvgSpeed();

    List<LocationSample> getCoordinatesLog();

    boolean isPhonePointingForward();

    void setPhonePointingForward(boolean pointingForward);
}
