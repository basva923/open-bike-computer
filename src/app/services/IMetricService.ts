import { Metric } from '../model/Metric';
import { IHeartRateSensorService } from './IHeartRateSensorService';
import { ILocationService } from './ILocationService';
import { PowerMeterService } from './power-meter.service';


export interface IMetricService {
    getLocationService(): ILocationService;
    getHeartRateSensorService(): IHeartRateSensorService;
    getPowerMeterService(): PowerMeterService;
    getByName(name: string): Metric | null;
    getNames(): string[];
}

