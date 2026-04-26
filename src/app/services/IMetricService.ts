import { Metric } from '../model/Metric';
import { IHeartRateSensorService } from './IHeartRateSensorService';
import { ILocationService } from './ILocationService';
import { IPowerMeterService } from './IPowerMeterService';
import { ISpeedSensorService } from './ISpeedSensorService';


export interface IMetricService {
    getLocationService(): ILocationService;
    getHeartRateSensorService(): IHeartRateSensorService;
    getPowerMeterService(): IPowerMeterService;
    getSpeedSensorService(): ISpeedSensorService;
    getByName(name: string): Metric | null;
    getNames(): string[];
}

