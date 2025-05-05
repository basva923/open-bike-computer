import { Component } from '@angular/core';
import { BluetoothService } from '../services/bluetooth.service';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HeartRateSensorService } from '../services/heart-rate-sensor.service';
import { ServiceFactory } from '../services/ServiceFactory';
import { MetricService } from '../services/metric.service';
import { PowerMeterService } from '../services/power-meter.service';

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
  protected powerMeter: PowerMeterService;


  constructor(protected metricService: MetricService) {
    this.heartRateSensor = ServiceFactory.getHeartRateSensorService();
    this.powerMeter = ServiceFactory.getPowerMeterService();
  }

  async startActivity() {
    this.metricService.startLogging();
  }

  async stopActivity() {
    this.metricService.stopLogging();
  }

  async ngOnInit() {
    this.reconnectToLastConnectedHeartRateSensor();
    this.reconnectToLastConnectedPowerMeter();
  }

  async requestHeartRateDevice() {
    await this.heartRateSensor.selectNewDevice();
  }

  async reconnectToLastConnectedHeartRateSensor() {
    await this.heartRateSensor.reconnectToLastConnected();
  }

  async requestPowerMeterDevice() {
    await this.powerMeter.selectNewDevice();
  }
  async reconnectToLastConnectedPowerMeter() {
    await this.powerMeter.reconnectToLastConnected();
  }
}
