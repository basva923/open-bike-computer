import { Component } from '@angular/core';
import { MetricService } from '../services/metric.service';
import { MetricType } from '../model/Metric';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.css'
})
export class MetricsComponent {
  protected config = [
    [MetricType.SPEED, MetricType.POWER],
    [MetricType.CADENCE, MetricType.HEART_RATE],
    [MetricType.ALTITUDE, MetricType.VERTICAL_SPEED],
    [MetricType.DISTANCE, MetricType.GRADE],
    [MetricType.TEMPERATURE, MetricType.POWER_BALENCE],
    // [MetricType.LATITUDE, MetricType.LONGITUDE],
    [MetricType.WHEEL_ROTATIONS, MetricType.DISTANCE]
  ]

  constructor(protected metricsService: MetricService) {
    this.metricsService = metricsService;
  }

  getNameForMetric(metricType: MetricType): string {
    const metric = this.metricsService.getByMetricType(metricType);
    return metric.getName();
  }

  getLastValueForMetric(metricType: MetricType): string {
    const metric = this.metricsService.getByMetricType(metricType);
    return metric.displayLastValue(false);
  }

  getUnitForMetric(metricType: MetricType): string {
    const metric = this.metricsService.getByMetricType(metricType);
    return metric.getPreferredUnit();
  }
}
