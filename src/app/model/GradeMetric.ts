import { LocationServiceEvent } from './LocationServiceEvent';
import { MetricService } from "../services/metric.service";
import { Util } from "../util/util";
import { Metric, MetricType } from "./Metric";

export class GradeMetric extends Metric {
    private neutralGrade: number = 0;

    private intervalId: any;

    constructor(metricService: MetricService) {
        super(MetricType.GRADE, 'Grade', '%', metricService);
    }

    startLogging(): void {
        if (this.intervalId) return;
        this.intervalId = setInterval(() => {
            const now = Date.now();
            const phoneGrade = this.metricService.getLocationService().gradeForHorizontalPhone;

            this.addValue(phoneGrade - this.neutralGrade, new Date(now));
        }, 500); // Log every half second
    }

    stopLogging(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    calibrateGrade(): void {
        const currentGrade = this.metricService.getLocationService().gradeForHorizontalPhone;
        this.neutralGrade = currentGrade;
        console.log(`Calibrated grade to ${this.neutralGrade}%`);
    }

}
