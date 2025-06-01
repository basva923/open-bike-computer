import { Injectable } from '@angular/core';

import { Decoder, Stream, Utils, Profile } from '@garmin/fitsdk';
import { Workout } from '../model/Workout';


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

  constructor() { }

  loadFitFile(fileContent: ArrayBuffer): void {
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