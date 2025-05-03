import { MetricService } from "../services/metric.service";
import { Metric } from "./Metric";

export class TemperatureMetric extends Metric {
    constructor(metricService: MetricService) {
        super('Temperature', '°K', metricService, '°C');
    }

    startLogging(): void {

    }

    stopLogging(): void {

    }
}
