import { Workout, WorkoutStep, DurationType, TargetType } from './Workout';

describe('Workout.fromGarminFitFile', () => {
    const sampleData = {
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
        ],
        sport: "cycling",
        wktName: "Test"
    };

    it('should parse valid steps and throw on unknown types', () => {
        // Only steps 0, 2, 3 are valid for the current parser
        const validSteps = [sampleData.workoutStepMesgs[0], sampleData.workoutStepMesgs[2], sampleData.workoutStepMesgs[3]];
        const workout = Workout.fromGarminFitFile({
            sport: sampleData.sport,
            wktName: sampleData.wktName,
            workoutStepMesgs: validSteps
        });

        expect(workout.sport).toBe('cycling');
        expect(workout.wktName).toBe('Test');
        expect(workout.steps.length).toBe(3);

        // Step 0
        expect(workout.steps[0].durationType).toBe(DurationType.DISTANCE);
        expect(workout.steps[0].durationValue).toBe(500000);
        expect(workout.steps[0].targetType).toBe(TargetType.POWER);
        expect(workout.steps[0].targetLow).toBe(1173);
        expect(workout.steps[0].targetHigh).toBe(1269);
        expect(workout.steps[0].wktStepName).toBe("Text to display");

        // Step 1 (original index 2)
        expect(workout.steps[1].durationType).toBe(DurationType.TIME);
        expect(workout.steps[1].durationValue).toBe(1200000);
        expect(workout.steps[1].targetType).toBe(TargetType.CADENCE);
        expect(workout.steps[1].targetLow).toBe(87);
        expect(workout.steps[1].targetHigh).toBe(93);
        expect(workout.steps[1].wktStepName).toBe("Rmp text");

        // Step 2 (original index 3)
        expect(workout.steps[2].durationType).toBe(DurationType.TIME);
        expect(workout.steps[2].durationValue).toBe(20000);
        expect(workout.steps[2].targetType).toBe(TargetType.POWER);
        expect(workout.steps[2].targetLow).toBe(1468);
        expect(workout.steps[2].targetHigh).toBe(4096);
        expect(workout.steps[2].wktStepName).toBe("Max effort please");
    });

    it('should throw on unknown durationType', () => {
        const step = {
            durationType: "open",
            targetType: "power3s",
            wktStepName: "Invalid durationType"
        };
        expect(() => WorkoutStep.fromGarminFitFile(step)).toThrowError(/Unknown duration type/);
    });

    it('should throw on unknown targetType', () => {
        const step = {
            durationType: "time",
            targetType: "open",
            wktStepName: "Invalid targetType"
        };
        expect(() => WorkoutStep.fromGarminFitFile(step)).toThrowError(/Unknown target type/);
    });
});
