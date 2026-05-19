/// <reference types="web-bluetooth" />

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BluetoothService {

  hrDevice: BluetoothDevice | null = null;
  devices: BluetoothDevice[] = [];

  constructor() {
    this.requestBluetoothDevices();
  }

  async requestBluetoothDevices() {
    this.devices = await navigator.bluetooth.getDevices();
    console.log(this.devices);
  }

  // Function to check if Bluetooth is enabled
  async isBluetoothEnabled() {
    const btPermission = await navigator.permissions.query({ name: "bluetooth" as PermissionName });

    return btPermission.state !== "denied";
  }

  async requestHeartRateDevice() {
    this.hrDevice = await navigator.bluetooth.requestDevice({
      filters: [
        { services: ["heart_rate"] },
      ],
      optionalServices: ['battery_service'] // Required to access service later.
    });

    const server = await this.hrDevice.gatt?.connect();
    server?.getPrimaryServices().then(services => {
      services.forEach(service => {
        console.log('Service:', service);
      });
    });
  }
}
