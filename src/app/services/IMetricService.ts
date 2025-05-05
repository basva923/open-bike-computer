import { Metric } from '../model/Metric';
import { IHeartRateSensorService } from './IHeartRateSensorService';
import { ILocationService } from './ILocationService';


export interface IMetricService {
    getLocationService(): ILocationService;
    getHeartRateSensorService(): IHeartRateSensorService;
    getByName(name: string): Metric | null;
    getNames(): string[];
}

