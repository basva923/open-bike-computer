import { MetricService } from "../services/metric.service";
import { Metric } from "./Metric";
import { SpeedSensorServiceEvent } from './SpeedSensorServiceEvent';

export class WheelRotationsMetric extends Metric {
    private speedSensorHandler = this.speedSensorEventHandler.bind(this);

    constructor(metricService: MetricService) {
        super('Wheel Rotations', '', metricService, '');
    }

    startLogging(): void {
        this.metricService.getSpeedSensorService().subscribeForSpeedData(this.speedSensorHandler);
    }

    stopLogging(): void {
        this.metricService.getSpeedSensorService().unsubscribeForSpeedData(this.speedSensorHandler);
    }

    speedSensorEventHandler(event: SpeedSensorServiceEvent): void {
        if (!event.speedSensorData.cumulativeWheelRevolutions) {
            return;
        }

        this.addValue(event.speedSensorData.cumulativeWheelRevolutions, event.speedSensorData.timestamp);
    }
}
