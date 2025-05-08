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

@Injectable({
  providedIn: 'root'
})
export class MetricService implements IMetricService {
  private locationService: LocationService;
  private heartRateSensorService: HeartRateSensorService;
  private powerMeterService: PowerMeterService;
  private speedSensorService: SpeedSensorService;
  private metrics: Metric[] = [];

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
      new WheelRotationsMetric(this)
    );
  }

  startLogging(): void {
    for (let i = 0; i < this.metrics.length; i++) {
      this.metrics[i].startLogging();
    }
  }

  stopLogging(): void {
    for (let i = 0; i < this.metrics.length; i++) {
      this.metrics[i].stopLogging();
    }
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
