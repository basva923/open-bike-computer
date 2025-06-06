import { Component, Input } from '@angular/core';
import { MetricService } from '../services/metric.service';
import { MetricType } from '../model/Metric';
import { CommonModule } from '@angular/common';

import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { F } from '@angular/cdk/a11y-module.d-DBHGyKoh';
import { ServiceFactory } from '../services/ServiceFactory';


@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [CommonModule, MatGridListModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.css'
})
export class MetricsComponent {
  protected config: MetricType[][] = []

  protected editModeIsActive = false;
  protected metricTypes: MetricType[] = Object.values(MetricType);
  protected metricsService: MetricService

  @Input()
  tabName!: string;

  constructor() {
    this.metricsService = ServiceFactory.getMetricService();
    this.loadConfigFromLocalStorage();
  }

  toggleEditMode() {
    if (this.editModeIsActive) {
      this.saveConfigToLocalStorage();
    }
    this.editModeIsActive = !this.editModeIsActive;
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
    const value = metric.displayLastValue(false);
    return value;
  }

  getUnitForMetric(metricType: MetricType): string {
    const metric = this.metricsService.getByMetricType(metricType);
    return metric.getPreferredUnit();
  }

  getRowSpan(metricCount: number): number {
    switch (metricCount) {
      case 1:
        return 20;
      case 2:
        return 15;
      case 3:
        return 10;
      default:
        return 10;
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

  onMetricTypeChange(selectedValue: MetricType, rowId: number, columnId: number) {
    console.log(selectedValue)
    this.config[rowId][columnId] = selectedValue;
  }

  onInsertMetric(rowId: number, columnId: number) {
    if (this.config[rowId].length < 4) {
      this.config[rowId] = [...this.config[rowId].slice(0, columnId), MetricType.POWER, ...this.config[rowId].slice(columnId)];
    }
  }

  onRemoveMetric(rowId: number, columnId: number) {
    if (this.config[rowId].length > 1) {
      this.config[rowId] = [...this.config[rowId].slice(0, columnId), ...this.config[rowId].slice(columnId + 1)];
    }
  }

  protected scaleMetricValues() {
    document.querySelectorAll('.metric-value').forEach((metric) => {
      const factor = 0.8;
      const parentWidth = metric.parentElement?.clientWidth;
      const textWidth = metric.scrollWidth;

      const parentHeight = metric.parentElement?.clientHeight;
      const textHeight = metric.scrollHeight;

      if (!(parentWidth && parentHeight && textWidth && textHeight)) {
        return;
      }

      if (textWidth / textHeight > parentWidth / parentHeight) {
        (metric as any).style.transform = 'scale(' + (parentWidth * factor / textWidth) + ')';
      } else {
        (metric as any).style.transform = 'scale(' + (parentHeight * factor / textHeight) + ')';
      }
    });
  }


  protected saveConfigToLocalStorage() {
    localStorage.setItem('metricsConfig.' + this.tabName, JSON.stringify(this.config));
  }
  protected loadConfigFromLocalStorage() {
    const config = localStorage.getItem('metricsConfig.' + this.tabName);
    if (config) {
      this.config = JSON.parse(config);
    } else {
      this.resetConfig();
    }
  }
  protected resetConfig() {
    this.config = [
      [MetricType.POWER],
      [MetricType.SPEED, MetricType.POWER],
      [MetricType.CADENCE, MetricType.HEART_RATE],
      [MetricType.ALTITUDE, MetricType.VERTICAL_SPEED],
      [MetricType.DISTANCE, MetricType.GRADE, MetricType.CADENCE],
      [MetricType.ALTITUDE, MetricType.ALTITUDE, MetricType.ALTITUDE],
      [MetricType.CADENCE],
      [MetricType.TEMPERATURE, MetricType.POWER_BALENCE],
      // [MetricType.LATITUDE, MetricType.LONGITUDE],
      [MetricType.WHEEL_ROTATIONS, MetricType.DISTANCE]
    ];
  }
}
