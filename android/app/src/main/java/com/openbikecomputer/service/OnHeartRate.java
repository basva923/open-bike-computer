package com.openbikecomputer.service;

import com.openbikecomputer.model.HeartRateData;

/** Listener for heart-rate sensor measurements. */
public interface OnHeartRate {
    void onHeartRate(HeartRateData data);
}
