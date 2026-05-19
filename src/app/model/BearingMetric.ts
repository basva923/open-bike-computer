import { LocationServiceEvent } from './LocationServiceEvent';
import { MetricService } from "../services/metric.service";
import { Metric, MetricType } from "./Metric";

export class BearingMetric extends Metric {
    private intervalId: any;

    constructor(metricService: MetricService) {
        super(MetricType.BEARING, 'Bearing', '°', metricService, '°');
    }

    startLogging(): void {
        if (this.intervalId) return;
        this.intervalId = setInterval(() => {
            this.bearingUpdateHandler();
        }, 1000); // Update every second
    }

    stopLogging(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    bearingUpdateHandler(): void {
        const bearing = this.metricService.getLocationService().bearingForHorizontalPhone;
        this.addValue(bearing, new Date());
    }
}
