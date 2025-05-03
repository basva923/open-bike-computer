import { HeartRateSensorServiceEvent } from "../services/heart-rate-sensor.service";
import { MetricService } from "../services/metric.service";
import { Metric } from "./Metric";

export class HeartRateMetric extends Metric {
    constructor(metricService: MetricService) {
        super('Heart Rate', 'bpm', metricService);
    }

    startLogging(): void {
        this.metricService.getHeartRateSensorService().substribeForHeartRate(this.handleHeartRateEvent.bind(this));
    }

    stopLogging(): void {
        this.metricService.getHeartRateSensorService().unsubscribeForHeartRate(this.handleHeartRateEvent.bind(this));
    }

    handleHeartRateEvent(event: HeartRateSensorServiceEvent): void {
        this.addValue(event.heartRate.heartRate, event.heartRate.timestamp);
    }
}
