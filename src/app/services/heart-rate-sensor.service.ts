import { Injectable } from '@angular/core';


export class HeartReateData {
  timestamp: Date;
  heartRate: number;
  contactDetected?: boolean;
  energyExpended?: number;
  rrIntervals?: number[];

  constructor(timestamp: Date, heartRate: number, contactDetected?: boolean, energyExpended?: number, rrIntervals?: number[]) {
    this.timestamp = timestamp;
    this.heartRate = heartRate;
    this.contactDetected = contactDetected;
    this.energyExpended = energyExpended;
    this.rrIntervals = rrIntervals;
  }
}

@Injectable({
  providedIn: 'root'
})
export class HeartRateSensorService {

  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private service: BluetoothRemoteGATTService | null = null;
  private charateristic: BluetoothRemoteGATTCharacteristic | null = null;
  private heartRates: HeartReateData[] = [];


  constructor() { }


  async connect() {
    if (!this.device) {
      console.error('No device selected');
      return;
    }
    this.server = await this.device.gatt!.connect();
    this.storeLastConnectedDevice();

    console.log('Connected to GATT Server:', this.server);
    this.service = await this.server.getPrimaryService('heart_rate');
    this.charateristic = await this.service.getCharacteristic('heart_rate_measurement');
    await this.charateristic.startNotifications();
    console.log('Notifications started for characteristic:', this.charateristic);

    this.addListener(this.storeHeartRate.bind(this));
  }

  async disconnect() {
    if (this.server) {
      await this.server.disconnect();
      this.server = null;
      this.service = null;
      this.charateristic = null;
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
      filters: [{ services: ['heart_rate'] }]
    });
    console.log('Selected:', this.device.name);

    this.connect();
  }

  get deviceSelected() {
    return this.device !== null;
  }

  get deviceName() {
    return this.device ? this.device.name : 'No device selected';
  }

  get isConnected() {
    return this.device?.gatt?.connected || false;
  }

  get heartRate(): HeartReateData | null {
    return this.heartRates.length > 0 ? this.heartRates[this.heartRates.length - 1] : null;
  }

  addListener(callback: (heartRate: HeartReateData) => void) {
    if (this.charateristic) {
      this.charateristic.addEventListener('characteristicvaluechanged', (event: Event) => {
        const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
        if (value) {
          const heartRate = this.parseHeartRate(value);
          callback(heartRate);
        }
      });
    }
  }

  protected storeHeartRate(value: HeartReateData) {
    console.log('Heart Rate:', value);
    this.heartRates.push(value);
    if (this.heartRates.length > 100) {
      this.heartRates.shift();
    }
  }

  protected parseHeartRate(value: any) {
    // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
    value = value.buffer ? value : new DataView(value);
    let flags = value.getUint8(0);
    let rate16Bits = flags & 0x1;
    let result: HeartReateData = new HeartReateData(new Date(), 0);
    let index = 1;
    if (rate16Bits) {
      result.heartRate = value.getUint16(index, /*littleEndian=*/true);
      index += 2;
    } else {
      result.heartRate = value.getUint8(index);
      index += 1;
    }
    let contactDetected = flags & 0x2;
    let contactSensorPresent = flags & 0x4;
    if (contactSensorPresent) {
      result.contactDetected = !!contactDetected;
    }
    let energyPresent = flags & 0x8;
    if (energyPresent) {
      result.energyExpended = value.getUint16(index, /*littleEndian=*/true);
      index += 2;
    }
    let rrIntervalPresent = flags & 0x10;
    if (rrIntervalPresent) {
      let rrIntervals = [];
      for (; index + 1 < value.byteLength; index += 2) {
        rrIntervals.push(value.getUint16(index, /*littleEndian=*/true));
      }
      result.rrIntervals = rrIntervals;
    }
    return result;
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
