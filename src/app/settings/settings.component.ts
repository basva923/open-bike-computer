import { Component } from '@angular/core';
import { BluetoothService } from '../services/bluetooth.service';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HeartRateSensorService } from '../services/heart-rate-sensor.service';
import { ServiceFactory } from '../services/ServiceFactory';
import { MetricService } from '../services/metric.service';
import { PowerMeterService } from '../services/power-meter.service';
import { SpeedSensorService } from '../services/speed-sensor.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NavigationService } from '../services/navigation.service';
import { TrainingService } from '../services/training.service';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, FormsModule, MatInputModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {

  bluetoothEnabled: boolean = false;
  devices: BluetoothDevice[] = [];
  protected heartRateSensor: HeartRateSensorService;
  protected powerMeter: PowerMeterService;
  protected speedSensor: SpeedSensorService;
  protected navigationService: NavigationService;
  protected trainingService: TrainingService;


  constructor(protected metricService: MetricService) {
    this.heartRateSensor = ServiceFactory.getHeartRateSensorService();
    this.powerMeter = ServiceFactory.getPowerMeterService();
    this.speedSensor = ServiceFactory.getSpeedSensorService();
    this.navigationService = ServiceFactory.getNavigationService();
    this.trainingService = ServiceFactory.getTrainingService();
  }

  async startActivity() {
    this.metricService.startLogging();
  }

  async stopActivity() {
    this.metricService.stopLogging();
  }

  onRouteFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = (e.target as FileReader).result;
        this.navigationService.loadRouteFileGPX(content as string);
      };
      reader.readAsText(file);
    }
  }

  onTrainingFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = (e.target as FileReader).result;
        this.trainingService.loadFitFile(content as ArrayBuffer);
      };
      reader.readAsArrayBuffer(file);
    }
  }

  async ngOnInit() {
    this.reconnectToLastConnectedHeartRateSensor();
    this.reconnectToLastConnectedPowerMeter();
    this.reconnectToLastConnectedSpeedSensor();
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

  async requestSpeedSensorDevice() {
    await this.speedSensor.selectNewDevice();
  }
  async reconnectToLastConnectedSpeedSensor() {
    await this.speedSensor.reconnectToLastConnected();
  }
}
