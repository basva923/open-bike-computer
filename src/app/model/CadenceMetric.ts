import { MetricService } from "../services/metric.service";
import { Metric } from "./Metric";

export class CadenceMetric extends Metric {
    constructor(metricService: MetricService) {
        super('Cadence', 'rpm', metricService);
    }

    startLogging(): void {
        // this.metricService.getCadenceSensorService().addCadenceListener((value, timestamp) => {
        //     this.addValue(value, timestamp);
        // });
    }

    stopLogging(): void {
        // this.metricService.getCadenceSensorService().removeCadenceListener();
    }
}
