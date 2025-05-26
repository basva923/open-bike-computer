import { LocationServiceEvent } from './LocationServiceEvent';
import { MetricService } from "../services/metric.service";
import { Metric, MetricType } from "./Metric";
import { setActiveConsumer } from '@angular/core/weak_ref.d-DWHPG08n';

export class BearingMetric extends Metric {
    private running = false;

    constructor(metricService: MetricService) {
        super(MetricType.BEARING, 'Bearing', '°', metricService, '°');
        setInterval(() => {
            this.bearingUpdateHandler();
        }
            , 1000); // Update every second
    }

    startLogging(): void {
        this.running = true;
    }

    stopLogging(): void {
        this.running = false;
    }

    bearingUpdateHandler(): void {
        if (!this.running) return;
        const bearing = this.metricService.getLocationService().bearingForHorizontalPhone;
        this.addValue(bearing, new Date());
    }
}
