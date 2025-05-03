import { MetricService } from "../services/metric.service";
import { Metric } from "./Metric";

export class PowerMetric extends Metric {
    constructor(metricService: MetricService) {
        super('Power', 'W', metricService);
    }

    startLogging(): void {

    }


    stopLogging(): void {

    }
}
