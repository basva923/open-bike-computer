import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MetricService } from '../services/metric.service';
import { MetricType } from '../model/Metric';
import { ServiceFactory } from '../services/ServiceFactory';


@Component({
    selector: 'app-laps',
    standalone: true,
    templateUrl: './laps.component.html',
    styleUrl: './laps.component.css',
    imports: [MatTableModule],
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


}
