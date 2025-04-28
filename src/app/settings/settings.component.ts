import { Component } from '@angular/core';
import { BluetoothService } from '../services/bluetooth.service';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HeartRateSensorService } from '../services/heart-rate-sensor.service';
import { ServiceFactory } from '../services/ServiceFactory';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {

  bluetoothEnabled: boolean = false;
  devices: BluetoothDevice[] = [];
  protected heartRateSensor: HeartRateSensorService;

  constructor() {
    this.heartRateSensor = ServiceFactory.getHeartRateSensorService();
  }

  async ngOnInit() {
    this.reconnectToLastConnected();
  }

  async requestHeartRateDevice() {
    await this.heartRateSensor.selectNewDevice();
  }

  async reconnectToLastConnected() {
    await this.heartRateSensor.reconnectToLastConnected();
  }
}
