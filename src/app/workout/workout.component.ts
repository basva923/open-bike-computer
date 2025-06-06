import { ChangeDetectorRef, Component } from '@angular/core';
import { TrainingService } from '../services/training.service';
import { ServiceFactory } from '../services/ServiceFactory';
import { MetricService } from '../services/metric.service';

import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MetricType } from '../model/Metric';


@Component({
  selector: 'app-workout',
  imports: [MatGridListModule, MatProgressBarModule, MatIconModule, MatButtonModule, MatDividerModule],
  templateUrl: './workout.component.html',
  styleUrl: './workout.component.css'
})
export class WorkoutComponent {

  protected trainingService: TrainingService;
  protected metricService: MetricService;

  protected remainingString: string = '---';
  protected currentHeartRate: string = '---';
  protected currentPower: string = '---';



  constructor(private cdr: ChangeDetectorRef) {
    this.trainingService = ServiceFactory.getTrainingService();
    this.metricService = ServiceFactory.getMetricService();

    setInterval(() => {
      this.updateRemainingString();
      this.updateCurrentHeartRate();
      this.updateCurrentPower();
      this.cdr.detectChanges(); // Trigger change detection to update the view
    }, 500); // Update every second
  }

  moveToNextStep() {
    this.trainingService.moveToNextStep();
  }

  moveToPreviousStep() {
    this.trainingService.moveToPreviousStep();
  }

  toggleStartStopWorkout() {
    if (this.trainingService.currentStep) {
      this.trainingService.stopWorkout();
    } else {
      this.trainingService.startWorkout();
    }
  }

  get workout() {
    return this.trainingService.getCurrentWorkout();
  }



  private get currentStep() {
    return this.trainingService.currentStep;
  }

  getProgressBarValue(row: number, column: number): number {
    if (!this.workout || !this.currentStep || !this.trainingService.targetMetric) {
      return 0;
    }
    const targetLow = this.currentStep.targetLow || 0;
    const targetHigh = this.currentStep.targetHigh || 0;
    const lowest = targetLow * 0.75;
    const highest = targetHigh * 1.25;
    let value = 0;
    if (row == 0) {
      value = this.trainingService.targetMetric.get3sAverage() || 0;
    } else if (row == 1) {
      value = this.trainingService.targetMetric.get30sAverage() || 0;
    } else if (row == 2) {
      value = this.trainingService.targetMetric.getAverageForLap() || 0;
    }
    if (column == 0) {
      return value < targetLow ? Math.max(0, (value - lowest) / (targetLow - lowest) * 100) : 100;
    } else if (column == 1) {
      if (value < targetLow) {
        return 0;
      } else if (value > targetHigh) {
        return 100;
      }
      return (value - targetLow) / (targetHigh - targetLow) * 100;
    } else if (column == 2) {
      return value > targetHigh ? Math.min(100, (value - targetHigh) / (highest - targetHigh) * 100) : 0;
    }
    throw new Error('Invalid row or column index');
  }



  private updateRemainingString() {
    let remainingString = "---";
    if (this.trainingService.remainingTime !== null) {
      const minutes = Math.floor(this.trainingService.remainingTime / 60);
      const seconds = Math.floor((this.trainingService.remainingTime % 60));
      remainingString = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    } else if (this.trainingService.remainingDistance !== null) {
      remainingString = `${(this.trainingService.remainingDistance / 1000).toFixed(2)}km`;
    }
    this.remainingString = remainingString;
  }

  private updateCurrentHeartRate() {
    const value = this.metricService.getByMetricType(MetricType.HEART_RATE)?.getLastValue() || 0;
    this.currentHeartRate = value > 0 ? `${value}` : '---';
  }

  private updateCurrentPower() {
    const value = this.metricService.getByMetricType(MetricType.POWER)?.getLastValue() || 0;
    this.currentPower = value > 0 ? `${value}` : '---';
  }


}
