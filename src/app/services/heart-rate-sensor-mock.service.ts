import { Injectable } from '@angular/core';
import { HeartRateSensorService, HeartReateData } from './heart-rate-sensor.service';


class HREvent extends Event {
  hr: HeartReateData;
  constructor(hr: HeartReateData) {
    super('newLocation');
    this.hr = hr;
  }
}

@Injectable({
  providedIn: 'root'
})
export class HeartRateSensorMockService extends HeartRateSensorService {
  eventTarget: EventTarget;

  constructor() {
    super();

    this.eventTarget = new EventTarget()
    setInterval(() => {
      const heartRate = new HeartReateData(new Date(), Math.floor(Math.random() * 100) + 50);
      this.eventTarget.dispatchEvent(new HREvent(heartRate));
      this.storeHeartRate(heartRate);
    }, 1000)
  }

  override async connect() {
    throw new Error('Method not implemented.');
  }

  override async disconnect() {
    throw new Error('Method not implemented.');
  }

  override async reconnectToLastConnected() {
    throw new Error('Method not implemented.');
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


  override addListener(callback: (heartRate: HeartReateData) => void) {
    this.eventTarget.addEventListener('heartRate', (event) => {
      const heartRate = (event as HREvent).hr;
      callback(heartRate);
    });
  }
}
