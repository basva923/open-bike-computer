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
    [MetricType.POWER],
    [MetricType.SPEED, MetricType.POWER],
    [MetricType.CADENCE, MetricType.HEART_RATE],
    [MetricType.ALTITUDE, MetricType.VERTICAL_SPEED],
    [MetricType.DISTANCE, MetricType.GRADE, MetricType.CADENCE],
    [MetricType.CADENCE],
    [MetricType.TEMPERATURE, MetricType.POWER_BALENCE],
    // [MetricType.LATITUDE, MetricType.LONGITUDE],
    [MetricType.WHEEL_ROTATIONS, MetricType.DISTANCE]
  ]

  constructor(protected metricsService: MetricService) {
    this.metricsService = metricsService;
  }

  ngAfterContentChecked() {
    this.scaleMetricValues();
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

  getRowHeight(metricCount: number): string {
    switch (metricCount) {
      case 1:
        return '20vh';
      case 2:
        return '15vh';
      case 3:
        return '10vh';
      default:
        return 'auto';
    }
  }

  getColumnSpan(metricCount: number): number {
    switch (metricCount) {
      case 1:
        return 12;
      case 2:
        return 6;
      case 3:
        return 4;
      default:
        return 12 / metricCount;
    }
  }

  protected scaleMetricValues() {
    document.querySelectorAll('.metric-value').forEach((metric) => {
      const parentWidth = metric.parentElement?.clientWidth;
      const textWidth = metric.scrollWidth;

      const parentHeight = metric.parentElement?.clientHeight;
      const textHeight = metric.scrollHeight;

      if (!(parentWidth && parentHeight && textWidth && textHeight)) {
        return;
      }

      if (textWidth / textHeight > parentWidth / parentHeight) {
        (metric as any).style.transform = 'scale(' + (parentWidth * 0.9 / textWidth) + ')';
      } else {
        (metric as any).style.transform = 'scale(' + (parentHeight * 0.9 / textHeight) + ')';
      }
    });

    console.log('scaleMetricValues: ', document.querySelectorAll('.metric-value').length);
  }
}
