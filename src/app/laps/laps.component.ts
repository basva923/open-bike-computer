import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MetricService } from '../services/metric.service';
import { MetricType } from '../model/Metric';
import { ServiceFactory } from '../services/ServiceFactory';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@Component({
    selector: 'app-laps',
    standalone: true,
    templateUrl: './laps.component.html',
    styleUrl: './laps.component.css',
    imports: [MatTableModule, MatIconModule, MatButtonModule],
})
export class LapsComponent {
    protected metricService: MetricService

    protected metricsToShow = [
        MetricType.SPEED,
        MetricType.POWER,
        MetricType.HEART_RATE,
        MetricType.CADENCE,
    ];

    constructor() {
        this.metricService = ServiceFactory.getMetricService();
    }


    get displayedColumns(): string[] {
        return new Array<string>("no", "duration", ...this.metricsToShow.map((metric) => metric.toString()));
    }

    get laps() {
        const laps = [];
        for (let i = 0; i < this.metricService.getNumberOfLaps(); i++) {
            const lapData: any = {
                no: i + 1,
                duration: this.metricService.displayLapDuration(i),
            };

            this.metricsToShow.forEach((metric) => {
                lapData[metric.toString()] = this.metricService.getByMetricType(metric).displayAverageForLap(i);
            });

            laps.push(lapData);
        }
        return laps;
    }



}
