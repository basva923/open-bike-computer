import { Workout, WorkoutStep, DurationType, TargetType } from './Workout';

describe('Workout.fromGarminFitFile', () => {
    const sampleData = {
        workoutMesgs: [
            {
                sport: "cycling",
                wktName: "Test"
            }
        ],
        workoutStepMesgs: [
            {
                durationType: "distance",
                durationValue: 500000,
                targetType: "power3s",
                customTargetValueLow: 1173,
                customTargetValueHigh: 1269,
                targetValue: 0,
                wktStepName: "Text to display",
                intensity: "interval",
                messageIndex: 0,
                durationDistance: 5000
            },
            {
                durationType: "time",
                durationValue: 1200000,
                targetType: "cadence",
                customTargetValueLow: 87,
                customTargetValueHigh: 93,
                targetValue: 0,
                wktStepName: "Rmp text",
                intensity: "recovery",
                messageIndex: 2,
                durationTime: 1200,
                customTargetCadenceLow: 87,
                customTargetCadenceHigh: 93,
                targetCadenceZone: 0
            },
            {
                durationType: "time",
                durationValue: 20000,
                targetType: "powerLap",
                customTargetValueLow: 1468,
                customTargetValueHigh: 4096,
                targetValue: 0,
                wktStepName: "Max effort please",
                intensity: "interval",
                messageIndex: 3,
                durationTime: 20
            }
        ]
    };

    it('should parse valid steps', () => {
        const workout = Workout.fromGarminFitFile(sampleData, 250, 180);

        expect(workout.sport).toBe('cycling');
        expect(workout.name).toBe('Test');
        expect(workout.steps.length).toBe(3);

        // Step 0
        expect(workout.steps[0].durationType).toBe(DurationType.DISTANCE);
        expect(workout.steps[0].durationValue).toBe(500);
        expect(workout.steps[0].targetType).toBe(TargetType.POWER);
        expect(workout.steps[0].targetLow).toBe(173);
        expect(workout.steps[0].targetHigh).toBe(269);
        expect(workout.steps[0].name).toBe("Text to display");

        // Step 1
        expect(workout.steps[1].durationType).toBe(DurationType.TIME);
        expect(workout.steps[1].durationValue).toBe(1200);
        expect(workout.steps[1].targetType).toBe(TargetType.CADENCE);
        expect(workout.steps[1].targetLow).toBe(87);
        expect(workout.steps[1].targetHigh).toBe(93);
        expect(workout.steps[1].name).toBe("Rmp text");

        // Step 2
        expect(workout.steps[2].durationType).toBe(DurationType.TIME);
        expect(workout.steps[2].durationValue).toBe(20);
        expect(workout.steps[2].targetType).toBe(TargetType.POWER);
        expect(workout.steps[2].targetLow).toBe(468);
        expect(workout.steps[2].targetHigh).toBe(3096);
        expect(workout.steps[2].name).toBe("Max effort please");
    });

    it('should throw on unknown durationType', () => {
        const step = {
            durationType: "unsupported",
            targetType: "power3s",
            wktStepName: "Invalid durationType"
        };
        expect(() => WorkoutStep.fromGarminFitFile(step, 250, 180)).toThrowError(/Unknown duration type/);
    });

    it('should parse open targetType as open', () => {
        const step = {
            durationType: "time",
            targetType: "open",
            wktStepName: "Invalid targetType"
        };
        expect(WorkoutStep.fromGarminFitFile(step, 250, 180).targetType).toBe(TargetType.OPEN);
    });
});
