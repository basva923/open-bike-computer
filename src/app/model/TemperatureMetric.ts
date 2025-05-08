import { MetricService } from "../services/metric.service";
import { Metric, MetricType } from "./Metric";

export class TemperatureMetric extends Metric {
    constructor(metricService: MetricService) {
        super(MetricType.TEMPERATURE, 'Temperature', '°K', metricService, '°C');
    }

    startLogging(): void {

    }

    stopLogging(): void {

    }
}
