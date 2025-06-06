import { Injectable } from '@angular/core';

import { Decoder, Stream, Utils, Profile } from '@garmin/fitsdk';
import { DurationType, TargetType, Workout, WorkoutStep } from '../model/Workout';
import { MetricService } from './metric.service';
import { ServiceFactory } from './ServiceFactory';
import { Metric, MetricType } from '../model/Metric';


class NewWorkoutEvent extends Event {
  constructor(public workout: Workout) {
    super('newWorkout');
  }
}


@Injectable({
  providedIn: 'root'
})
export class TrainingService {
  private workout: Workout | null = null;
  private eventTarget: EventTarget = new EventTarget();

  private currentStepIndex: number = -1;
  private currentStepStartTime: number = 0;
  private currentStepStartDistance: number = 0;

  private metricService: MetricService;

  constructor() {
    this.metricService = ServiceFactory.getMetricService();
    setInterval(() => {
      this.checkWorkoutUpdate();
    }
      , 500);
  }

  loadFitFile(fileContent: ArrayBuffer): void {
    this.stopWorkout(); // Stop any existing workout before loading a new one

    const stream = Stream.fromByteArray(fileContent);
    const decoder = new Decoder(stream);

    const { messages, errors } = decoder.read();
    if (errors.length > 0) {
      console.error("Errors while reading FIT file:", errors);
    }
    console.log(JSON.stringify(messages, null, 2));
    this.workout = Workout.fromGarminFitFile(messages);
    this.eventTarget.dispatchEvent(new NewWorkoutEvent(this.workout));
  }

  addNewWorkoutListener(callback: (event: NewWorkoutEvent) => void): void {
    this.eventTarget.addEventListener('newWorkout', callback as any);
  }
  removeNewWorkoutListener(callback: (event: NewWorkoutEvent) => void): void {
    this.eventTarget.removeEventListener('newWorkout', callback as any);
  }

  getCurrentWorkout(): Workout | null {
    return this.workout;
  }

  startWorkout(): void {
    if (!this.workout) {
      throw new Error("No workout loaded");
    }
    if (this.currentStepIndex !== -1) {
      throw new Error("Workout already started");
    }
    this.moveToNextStep();
  }

  stopWorkout(): void {
    this.workout = null;
    this.currentStepIndex = -1;
    this.currentStepStartTime = 0;
    this.currentStepStartDistance = 0;
  }

  protected checkWorkoutUpdate(): void {
    if (!this.workout || this.currentStepIndex < 0) {
      return;
    }
    const currentStep = this.currentStep;
    if (!currentStep) {
      return;
    }
    if (this.remainingTime !== null && this.remainingTime <= 0) {
      this.moveToNextStep();
    }
    if (this.remainingDistance !== null && this.remainingDistance <= 0) {
      this.moveToNextStep();
    }
  }

  moveToNextStep(): void {
    if (!this.workout) {
      throw new Error("No workout loaded");
    }
    this.currentStepIndex++;
    this.currentStepStartTime = new Date().getTime();
    this.currentStepStartDistance = this.metricService.getByMetricType(MetricType.DISTANCE)?.getLastValue() || 0;
  }

  moveToPreviousStep(): void {
    if (!this.workout || this.currentStepIndex <= 0) {
      throw new Error("No previous step available");
    }
    this.currentStepIndex--;
    this.currentStepStartTime = new Date().getTime();
    this.currentStepStartDistance = this.metricService.getByMetricType(MetricType.DISTANCE)?.getLastValue() || 0;
  }


  get currentStep(): WorkoutStep | null {
    if (!this.workout || this.currentStepIndex >= this.workout.steps.length || this.currentStepIndex < 0) {
      return null;
    }
    return this.workout.steps[this.currentStepIndex];
  }

  get nextStep(): WorkoutStep | null {
    if (!this.workout || this.currentStepIndex + 1 >= this.workout.steps.length) {
      return null;
    }
    return this.workout.steps[this.currentStepIndex + 1];
  }

  get remainingTime(): number | null {
    if (!this.workout || this.currentStepIndex < 0) {
      return null;
    }
    const currentStep = this.currentStep;
    if (!currentStep || currentStep.durationType !== DurationType.TIME) {
      return null;
    }
    const elapsedTime = (new Date().getTime() - this.currentStepStartTime) / 1000; // Convert to seconds
    return currentStep.durationValue - elapsedTime;
  }

  get remainingDistance(): number | null {
    if (!this.workout || this.currentStepIndex < 0) {
      return null;
    }
    const currentStep = this.currentStep;
    if (!currentStep || currentStep.durationType !== DurationType.DISTANCE) {
      return null;
    }
    const currentDistance = this.metricService.getByMetricType(MetricType.DISTANCE)?.getLastValue() || 0;
    return currentStep.durationValue - (currentDistance - this.currentStepStartDistance);
  }

  get targetMetric(): Metric | null {
    const currentStep = this.currentStep;
    if (!currentStep) {
      return null;
    }
    switch (currentStep.targetType) {
      case TargetType.POWER:
        return this.metricService.getByMetricType(MetricType.POWER);
      case TargetType.HEART_RATE:
        return this.metricService.getByMetricType(MetricType.HEART_RATE);
      case TargetType.SPEED:
        return this.metricService.getByMetricType(MetricType.SPEED);
      case TargetType.CADENCE:
        return this.metricService.getByMetricType(MetricType.CADENCE);
      default:
        return null;
    }
  }

}


// Example workout
// {
//   "fileIdMesgs": [
//     {
//       "manufacturer": "development",
//       "type": "workout",
//       "product": 1,
//       "productName": "Intervals.icu"
//     }
//   ],
//     "workoutMesgs": [
//       {
//         "sport": "cycling",
//         "wktName": "Test",
//         "numValidSteps": 4
//       }
//     ],
//       "workoutStepMesgs": [
//         {
//           "durationType": "distance",
//           "durationValue": 500000,
//           "targetType": "power3s",
//           "customTargetValueLow": 1173,
//           "customTargetValueHigh": 1269,
//           "targetValue": 0,
//           "wktStepName": "Text to display",
//           "intensity": "interval",
//           "messageIndex": 0,
//           "durationDistance": 5000
//         },
//         {
//           "durationType": "open",
//           "targetType": "open",
//           "wktStepName": "Press lap",
//           "intensity": "warmup",
//           "messageIndex": 1
//         },
//         {
//           "durationType": "time",
//           "durationValue": 1200000,
//           "targetType": "cadence",
//           "customTargetValueLow": 87,
//           "customTargetValueHigh": 93,
//           "targetValue": 0,
//           "wktStepName": "Rmp text",
//           "intensity": "recovery",
//           "messageIndex": 2,
//           "durationTime": 1200,
//           "customTargetCadenceLow": 87,
//           "customTargetCadenceHigh": 93,
//           "targetCadenceZone": 0
//         },
//         {
//           "durationType": "time",
//           "durationValue": 20000,
//           "targetType": "powerLap",
//           "customTargetValueLow": 1468,
//           "customTargetValueHigh": 4096,
//           "targetValue": 0,
//           "wktStepName": "Max effort please",
//           "intensity": "interval",
//           "messageIndex": 3,
//           "durationTime": 20
//         }
//       ]
// }