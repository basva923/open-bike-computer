import { Injectable } from '@angular/core';
import { LocationService } from './location.service';
import { HeartRateSensorService } from './heart-rate-sensor.service';
import { ServiceFactory } from './ServiceFactory';
import { Metric, MetricType } from '../model/Metric';
import { AltitudeMetric } from '../model/AltitudeMetric';
import { VerticalSpeedMetric } from '../model/VerticalSpeedMetric';
import { TemperatureMetric } from '../model/TemperatureMetric';
import { SpeedMetric } from '../model/SpeedMetric';
import { PowerMetric } from '../model/PowerMetric';
import { LongitudeMetric } from '../model/LongitudeMetric';
import { LatitudeMetric } from '../model/LatitudeMetric';
import { HeartRateMetric } from '../model/HeartRateMetric';
import { GradeMetric } from '../model/GradeMetric';
import { DistanceMetric } from '../model/DistanceMetric';
import { CadenceMetric } from '../model/CadenceMetric';
import { IMetricService } from './IMetricService';
import { PowerMeterService } from './power-meter.service';
import { PowerBalenceMetric } from '../model/PowerBalenceMetric';
import { SpeedSensorService } from './speed-sensor.service';
import { WheelRotationsMetric } from '../model/WheelRotationsMetric';
import { BearingMetric } from '../model/BearingMetric';
import { LapCounterMetric } from '../model/LapCounterMetric';

@Injectable({
  providedIn: 'root'
})
export class MetricService implements IMetricService {
  private locationService: LocationService;
  private heartRateSensorService: HeartRateSensorService;
  private powerMeterService: PowerMeterService;
  private speedSensorService: SpeedSensorService;
  private metrics: Metric[] = [];
  private running: boolean = false;

  constructor() {
    this.locationService = ServiceFactory.getLocationService();
    this.heartRateSensorService = ServiceFactory.getHeartRateSensorService();
    this.powerMeterService = ServiceFactory.getPowerMeterService();
    this.speedSensorService = ServiceFactory.getSpeedSensorService();

    this.metrics.push(
      new AltitudeMetric(this),
      new VerticalSpeedMetric(this),
      new TemperatureMetric(this),
      new SpeedMetric(this),
      new PowerMetric(this),
      new LongitudeMetric(this),
      new LatitudeMetric(this),
      new HeartRateMetric(this),
      new GradeMetric(this),
      new DistanceMetric(this),
      new CadenceMetric(this),
      new PowerBalenceMetric(this),
      new WheelRotationsMetric(this),
      new BearingMetric(this),
      new LapCounterMetric(this)
    );
  }

  newLap(): void {
    for (let i = 0; i < this.metrics.length; i++) {
      this.metrics[i].newLap();
    }
  }

  startLogging(): void {
    if (this.running) {
      console.warn('Logging is already running');
      return;
    }
    this.running = true;
    for (let i = 0; i < this.metrics.length; i++) {
      this.metrics[i].startLogging();
    }
  }

  stopLogging(): void {
    if (!this.running) {
      console.warn('Logging is not running');
      return;
    }
    this.running = false;
    for (let i = 0; i < this.metrics.length; i++) {
      this.metrics[i].stopLogging();
    }
  }

  isRunning(): boolean {
    return this.running;
  }

  getLocationService(): LocationService {
    return this.locationService;
  }

  getHeartRateSensorService(): HeartRateSensorService {
    return this.heartRateSensorService;
  }

  getPowerMeterService(): PowerMeterService {
    return this.powerMeterService;
  }

  getSpeedSensorService(): SpeedSensorService {
    return this.speedSensorService;
  }

  getByName(name: string): Metric | null {
    for (let i = 0; i < this.metrics.length; i++) {
      if (this.metrics[i].getName() === name) {
        return this.metrics[i];
      }
    }
    return null;
  }

  getNames(): string[] {
    const names: string[] = [];
    for (let i = 0; i < this.metrics.length; i++) {
      names.push(this.metrics[i].getName());
    }
    return names;
  }

  getByMetricType(metricType: MetricType): Metric {
    for (let i = 0; i < this.metrics.length; i++) {
      if (this.metrics[i].getType() === metricType) {
        return this.metrics[i];
      }
    }
    throw new Error(`Metric with type ${metricType} not found`);
  }

}
