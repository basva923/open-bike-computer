package com.openbikecomputer.service;

import com.openbikecomputer.model.PowerMeterData;

/** Listener for power-meter measurements. */
public interface OnPowerData {
    void onPowerData(PowerMeterData data);
}
