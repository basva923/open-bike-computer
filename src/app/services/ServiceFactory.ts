import { HeartRateSensorMockService } from "./heart-rate-sensor-mock.service";
import { HeartRateSensorService } from "./heart-rate-sensor.service";
import { LocationMockService } from "./location-mock.service";
import { LocationService } from "./location.service";


export class ServiceFactory {
    private static heartRateSensorServiceInstance: HeartRateSensorService | null = null;
    private static locationServiceInstance: LocationService | null = null;

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
}
