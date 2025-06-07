import { Metric, MetricType } from "./Metric";
import { MetricService } from "../services/metric.service";
import { UnitToString } from "../util/unit-to-string";

export class CurrentTimeMetric extends Metric {
    private intervalId: any;

    constructor(metricService: MetricService) {
        super(MetricType.CURRENT_TIME, 'Current Time', 's', metricService, 's', 0);
    }

    startLogging(): void {
        if (this.intervalId) return;
        this.intervalId = setInterval(() => {
            const now = new Date();
            this.addValue(now.getTime() / 1000, now);
        }, 1000); // Log every second
    }

    stopLogging(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    protected override displayValue(value: number | null, includeUnit: boolean = true): string {
        if (value === null) return '---';
        const date = new Date(value * 1000); // Convert seconds to milliseconds
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const formattedTime = `${hours}:${minutes}`;
        return formattedTime;
    }

}
