import { LocationServiceEvent } from './LocationServiceEvent';
import { MetricService } from "../services/metric.service";
import { Metric } from "./Metric";
import { SpeedSensorServiceEvent } from './SpeedSensorServiceEvent';
import { SpeedSensorData } from './SpeedSensorData';
import { last } from 'rxjs';

export class SpeedMetric extends Metric {
    private locationHandler = this.locationEventHandler.bind(this);
    private speedSensorHandler = this.speedSensorEventHandler.bind(this);
    private lastSpeedSensorDatas: SpeedSensorData[] = [];

    constructor(metricService: MetricService, private wheelCircumference: number = 2.1) {
        super('Speed', 'm/s', metricService, 'km/h');
    }

    startLogging(): void {
        if (this.metricService.getSpeedSensorService().deviceSelected) {
            this.metricService.getSpeedSensorService().subscribeForSpeedData(this.speedSensorHandler);
        } else {
            this.metricService.getLocationService().subscribeForLocation(this.locationHandler);
        }
    }

    stopLogging(): void {
        this.metricService.getLocationService().unsubscribeForLocation(this.locationHandler);
        this.metricService.getSpeedSensorService().unsubscribeForSpeedData(this.speedSensorHandler);
    }

    locationEventHandler(event: LocationServiceEvent): void {
        const speed = event.location.coords.speed;
        if (speed !== null) {
            this.addValue(speed, new Date(event.location.timestamp));
        } else {
            // If speed is null, we can set it to 0 or handle it as needed
            this.addValue(0, new Date(event.location.timestamp));
        }
    }

    speedSensorEventHandler(event: SpeedSensorServiceEvent): void {
        if (!event.speedSensorData.cumulativeWheelRevolutions) {
            return;
        }

        const lastDataWithLessWheelRevolutions = this.getLastSpeedSensorDataWithLessWheelRevolutions(event.speedSensorData.cumulativeWheelRevolutions);
        if (lastDataWithLessWheelRevolutions === null) {
            this.addValue(0, new Date(event.speedSensorData.timestamp));
        } else {
            const diffRotations = event.speedSensorData.cumulativeWheelRevolutions - (lastDataWithLessWheelRevolutions!.cumulativeWheelRevolutions || 0);
            const timediff = (event.speedSensorData.lastWheelEventTime!.getTime() - (lastDataWithLessWheelRevolutions!.lastWheelEventTime!.getTime())) / 1000; // in seconds
            const speed = (diffRotations * this.wheelCircumference) / timediff; // in m/s
            this.addValue(speed, event.speedSensorData.timestamp);
        }
        this.lastSpeedSensorDatas.push(event.speedSensorData);
        if (this.lastSpeedSensorDatas.length > 10) {
            this.lastSpeedSensorDatas.shift();
        }
    }

    getLastSpeedSensorDataWithLessWheelRevolutions(cumulativeWheelRevolutions: number): SpeedSensorData | null {
        for (let i = this.lastSpeedSensorDatas.length - 1; i >= 0; i--) {
            const data = this.lastSpeedSensorDatas[i];
            if (data.cumulativeWheelRevolutions && data.cumulativeWheelRevolutions <= cumulativeWheelRevolutions) {
                return data;
            }
        }
        return null;
    }

}
