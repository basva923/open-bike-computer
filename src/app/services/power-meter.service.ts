import { Injectable } from '@angular/core';

import { IPowerMeterService } from './IPowerMeterService';
import { PowerMeterServiceEvent } from '../model/PowerMeterServiceEvent';
import { PowerMeterData } from '../model/PowerMeterData';

@Injectable({
  providedIn: 'root'
})
export class PowerMeterService implements IPowerMeterService {

  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private service: BluetoothRemoteGATTService | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  protected powerMeterEvent = new EventTarget();

  constructor() { }

  async connect() {
    if (!this.device) {
      console.error('No device selected');
      return;
    }
    this.server = await this.device.gatt!.connect();
    this.storeLastConnectedDevice();

    console.log('Connected to GATT Server:', this.server);
    this.service = await this.server.getPrimaryService('cycling_power');
    this.characteristic = await this.service.getCharacteristic('cycling_power_measurement');
    await this.characteristic.startNotifications();
    console.log('Notifications started for characteristic:', this.characteristic);

    this.characteristic.addEventListener('characteristicvaluechanged', (event: Event) => {
      const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
      if (value) {
        const powerData = this.parsePowerData(value);
        this.powerMeterEvent.dispatchEvent(new PowerMeterServiceEvent(powerData));
      }
    });
  }

  async disconnect() {
    if (this.server) {
      await this.server.disconnect();
      this.server = null;
      this.service = null;
      this.characteristic = null;
    }
  }

  async reconnectToLastConnected() {
    if (this.isConnected) {
      return;
    }
    const devices = await navigator.bluetooth.getDevices();
    console.log('Devices:', devices);
    for (const device of devices) {
      if (device.id === this.getLastConnectedDevice()) {
        this.device = device;
        console.log('Selected:', this.device.name);
        await this.connect();
        return;
      }
    }
  }

  async selectNewDevice() {
    this.disconnect();
    this.device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['cycling_power'] }]
    });
    console.log('Selected:', this.device.name);

    this.connect();
  }

  get deviceSelected() {
    return this.device !== null;
  }

  get deviceName(): string {
    return this.device?.name ?? 'No device selected';
  }

  get isConnected() {
    return this.device?.gatt?.connected || false;
  }

  subscribeForPowerData(callback: (event: PowerMeterServiceEvent) => void) {
    this.powerMeterEvent.addEventListener('powerMeterServiceEvent', callback as any);
  }

  unsubscribeForPowerData(callback: (event: PowerMeterServiceEvent) => void) {
    this.powerMeterEvent.removeEventListener('powerMeterServiceEvent', callback as any);
  }

  protected parsePowerData(value: DataView): PowerMeterData {
    const flags = value.getUint16(0, true);
    const instantaneousPower = value.getInt16(2, true);

    const powerData: PowerMeterData = new PowerMeterData(new Date(), instantaneousPower);

    let index = 4;

    if (flags & 0x01) { // Pedal Power Balance Present
      powerData.balence = value.getUint8(index) / 2; // Unit is 1/2 percent
      index += 1;
    }

    if (flags & 0x04) { // Accumulated Torque Present
      powerData.accumulatedTorque = value.getUint16(index, true) / 32; // Unit is 1/32 Nm
      index += 2;
    }

    // if (flags & 0x10) { // Wheel Revolution Data Present
    //   powerData.cumulativeWheelRevolutions = value.getUint32(index, true);
    //   index += 4;
    //   powerData.lastWheelEventTime = value.getUint16(index, true) / 2048; // Unit is 1/2048 second
    //   index += 2;
    // }

    if (flags & 0x20) { // Crank Revolution Data Present
      powerData.cumulativeCrankRevolutions = value.getUint16(index, true);
      index += 2;
      powerData.lastCrankEventTimestamp = value.getUint16(index, true); // Unit is 1/1024 second
      index += 2;
    }

    return powerData;
  }

  private storeLastConnectedDevice() {
    if (this.device) {
      localStorage.setItem('lastConnectedDevice', this.device.id);
    }
  }

  private getLastConnectedDevice() {
    return localStorage.getItem('lastConnectedDevice');
  }
}