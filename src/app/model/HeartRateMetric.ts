import { MetricService } from "../services/metric.service";
import { HeartRateSensorServiceEvent } from "./HeartRateSensorServiceEvent";
import { Metric, MetricType } from "./Metric";

export class HeartRateMetric extends Metric {
    private handler = this.handleHeartRateEvent.bind(this);

    constructor(metricService: MetricService) {
        super(MetricType.HEART_RATE, 'Heart Rate', 'bpm', metricService);
    }

    startLogging(): void {
        this.metricService.getHeartRateSensorService().substribeForHeartRate(this.handler);
    }

    stopLogging(): void {
        this.metricService.getHeartRateSensorService().unsubscribeForHeartRate(this.handler);
    }

    handleHeartRateEvent(event: HeartRateSensorServiceEvent): void {
        this.addValue(event.heartRate.heartRate, event.heartRate.timestamp);
    }
}
