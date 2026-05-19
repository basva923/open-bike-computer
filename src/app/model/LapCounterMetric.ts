import { Metric, MetricType } from "./Metric";
import { IMetricService } from "../services/IMetricService";

export class LapCounterMetric extends Metric {
    constructor(metricService: IMetricService) {
        super(MetricType.LAP_COUNTER as MetricType, 'Lap Counter', 'laps', metricService, 'laps', 0);
    }

    startLogging(): void {
        // No external event to subscribe to; lap count is managed internally
    }

    stopLogging(): void {
        // No external event to unsubscribe from
    }

    override newLap(): void {
        super.newLap();
        this.addValue(this.laps.length - 1, new Date());
    }

}
