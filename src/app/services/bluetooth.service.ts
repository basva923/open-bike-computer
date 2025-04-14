/// <reference types="web-bluetooth" />

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BluetoothService {

  hrDevice: BluetoothDevice | null = null;

  constructor() { }


  // Function to check if Bluetooth is enabled
  async isBluetoothEnabled() {
    const btPermission = await navigator.permissions.query({ name: "bluetooth" as PermissionName });

    return btPermission.state !== "denied";
  }

  async requestBluetoothDevices() {
    navigator.bluetooth.requestDevice({
      filters: [
        { services: ["heart_rate"] },
      ],
      optionalServices: ['battery_service'] // Required to access service later.
    })
      .then(device => { this.hrDevice = device; })
      .catch(error => { console.error(error); });
  }
}
