import { Injectable } from '@angular/core';
import { HeartRateSensorService } from './heart-rate-sensor.service';
import { HeartReateData } from '../model/HeartReateData';
import { HeartRateSensorServiceEvent } from '../model/HeartRateSensorServiceEvent';


@Injectable({
  providedIn: 'root'
})
export class HeartRateSensorMockService extends HeartRateSensorService {

  constructor() {
    super();
  }

  override async connect() {
    setInterval(() => {
      const heartRate = new HeartReateData(new Date(), Math.floor(Math.random() * 100) + 50);
      this.heartRateEvent.dispatchEvent(new HeartRateSensorServiceEvent(heartRate));
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
    return "Mock Heart Rate Sensor";
  }

  override get isConnected() {
    return true;
  }

}
