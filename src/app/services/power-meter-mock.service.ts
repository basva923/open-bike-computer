import { Injectable } from '@angular/core';
import { PowerMeterService } from './power-meter.service';
import { PowerMeterData } from '../model/PowerMeterData';
import { PowerMeterServiceEvent } from '../model/PowerMeterServiceEvent';

@Injectable({
  providedIn: 'root'
})
export class PowerMeterMockService extends PowerMeterService {

  constructor() {
    super();
  }

  override async connect() {
    setInterval(() => {
      const powerData = new PowerMeterData(
        new Date(),
        Math.floor(Math.random() * 100) + 300,
        Math.random(),
        Math.floor(Math.random() * 10) + 80,
        Math.random(),
        Math.random());

      this.powerMeterEvent.dispatchEvent(new PowerMeterServiceEvent(powerData));
    }, 1000)
  }

  override async disconnect() {
    throw new Error('Method not implemented.');
  }

  override async reconnectToLastConnected() {
    await this.connect();
  }

  override async selectNewDevice() {
    throw new Error('Method not implemented.');
  }

  override get deviceSelected() {
    return true;
  }

  override get deviceName() {
    return "Mock Power Meter";
  }

  override get isConnected() {
    return true;
  }
}
