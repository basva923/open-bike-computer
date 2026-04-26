import { HeartRateSensorMockService } from "./heart-rate-sensor-mock.service";
import { HeartRateSensorService } from "./heart-rate-sensor.service";
import { LocationMockService } from "./location-mock.service";
import { LocationService } from "./location.service";
import { MetricService } from "./metric.service";
import { NavigationService } from "./navigation.service";
import { PowerMeterMockService } from "./power-meter-mock.service";
import { PowerMeterService } from "./power-meter.service";
import { SpeedSensorMockService } from "./speed-sensor-mock.service";
import { SpeedSensorService } from "./speed-sensor.service";
import { TrainingService } from "./training.service";


export class ServiceFactory {
    private static heartRateSensorServiceInstance: HeartRateSensorService | null = null;
    private static locationServiceInstance: LocationService | null = null;
    private static powerMeterServiceInstance: PowerMeterService | null = null;
    private static speedSensorServiceInstance: SpeedSensorService | null = null;
    private static navigationServiceInstance: NavigationService | null = null;
    private static trainingServiceInstance: TrainingService | null = null;
    private static metricServiceInstance: MetricService | null = null;
    private static mockEnabled = false;

    static getHeartRateSensorService(): HeartRateSensorService {
        if (!this.heartRateSensorServiceInstance) {
            if (this.mockEnabled) {
                this.heartRateSensorServiceInstance = new HeartRateSensorMockService();
            } else {
                this.heartRateSensorServiceInstance = new HeartRateSensorService();
            }
        }
        return this.heartRateSensorServiceInstance;
    }

    static getLocationService(): LocationService {
        if (!this.locationServiceInstance) {
            if (this.mockEnabled) {
                this.locationServiceInstance = new LocationMockService();
            } else {
                this.locationServiceInstance = new LocationService();
            }
        }
        return this.locationServiceInstance;
    }

    static getPowerMeterService(): PowerMeterService {
        if (!this.powerMeterServiceInstance) {
            if (this.mockEnabled) {
                this.powerMeterServiceInstance = new PowerMeterMockService();
            } else {
                this.powerMeterServiceInstance = new PowerMeterService();
            }
        }
        return this.powerMeterServiceInstance;
    }

    static getSpeedSensorService(): SpeedSensorService {
        if (!this.speedSensorServiceInstance) {
            if (this.mockEnabled) {
                this.speedSensorServiceInstance = new SpeedSensorMockService();
            } else {
                this.speedSensorServiceInstance = new SpeedSensorService();
            }
        }
        return this.speedSensorServiceInstance;
    }


    static getNavigationService(): NavigationService {
        if (!this.navigationServiceInstance) {
            this.navigationServiceInstance = new NavigationService();
        }
        return this.navigationServiceInstance;
    }


    static getTrainingService(): TrainingService {
        if (!this.trainingServiceInstance) {
            this.trainingServiceInstance = new TrainingService();
        }
        return this.trainingServiceInstance;
    }

    static getMetricService(): MetricService {
        if (!this.metricServiceInstance) {
            this.metricServiceInstance = new MetricService();
        }
        return this.metricServiceInstance;
    }
}
