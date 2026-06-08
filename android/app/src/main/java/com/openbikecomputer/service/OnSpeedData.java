package com.openbikecomputer.service;

import com.openbikecomputer.model.SpeedSensorData;

/** Listener for speed/cadence (CSC) sensor measurements. */
public interface OnSpeedData {
    void onSpeedData(SpeedSensorData data);
}
