package com.openbikecomputer.service;

import com.openbikecomputer.model.LocationSample;

/** Listener for new GPS fixes. Replaces the DOM 'newLocation' event. */
public interface OnLocationUpdate {
    void onLocation(LocationSample sample);
}
