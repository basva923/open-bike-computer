import { Component } from '@angular/core';
import { BluetoothService } from '../services/bluetooth.service';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HeartRateSensorService } from '../services/heart-rate-sensor.service';
import { ServiceFactory } from '../services/ServiceFactory';
import { MetricService } from '../services/metric.service';

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


  constructor(protected metricService: MetricService) {
    this.heartRateSensor = ServiceFactory.getHeartRateSensorService();
  }

  async startActivity() {
    this.metricService.startLogging();
  }

  async stopActivity() {
    this.metricService.stopLogging();
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
