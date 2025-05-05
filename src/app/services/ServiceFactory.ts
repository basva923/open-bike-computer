import { HeartRateSensorMockService } from "./heart-rate-sensor-mock.service";
import { HeartRateSensorService } from "./heart-rate-sensor.service";
import { LocationMockService } from "./location-mock.service";
import { LocationService } from "./location.service";
import { PowerMeterMockService } from "./power-meter-mock.service";
import { PowerMeterService } from "./power-meter.service";


export class ServiceFactory {
    private static heartRateSensorServiceInstance: HeartRateSensorService | null = null;
    private static locationServiceInstance: LocationService | null = null;
    private static powerMeterServiceInstance: PowerMeterService | null = null;

    static getHeartRateSensorService(): HeartRateSensorService {
        if (!this.heartRateSensorServiceInstance) {
            this.heartRateSensorServiceInstance = new HeartRateSensorMockService();
        }
        return this.heartRateSensorServiceInstance;
    }

    static getLocationService(): LocationService {
        if (!this.locationServiceInstance) {
            this.locationServiceInstance = new LocationMockService();
        }
        return this.locationServiceInstance;
    }

    static getPowerMeterService(): PowerMeterService {
        if (!this.powerMeterServiceInstance) {
            this.powerMeterServiceInstance = new PowerMeterMockService();
        }
        return this.powerMeterServiceInstance;
    }
}
