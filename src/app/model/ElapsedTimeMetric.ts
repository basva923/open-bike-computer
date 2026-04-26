import { Metric, MetricType } from "./Metric";
import { MetricService } from "../services/metric.service";
import { Util } from "../util/util";
import { UnitToString } from "../util/unit-to-string";

export class ElapsedTimeMetric extends Metric {
    private intervalId: any;
    private startTime: number | null = null;

    constructor(metricService: MetricService) {
        super(MetricType.ELAPSED_TIME, 'Elapsed Time', 's', metricService, 's', 0);
    }

    startLogging(): void {
        if (this.intervalId) return;
        if (this.startTime === null) {
            this.startTime = Date.now();
        }
        this.intervalId = setInterval(() => {
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - this.startTime!) / 1000);
            this.addValue(elapsedSeconds, new Date(now));
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
        return UnitToString.secondsToTime(value);
    }
}
