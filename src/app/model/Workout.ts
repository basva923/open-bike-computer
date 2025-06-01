export enum DurationType {
    TIME = 'TIME',
    DISTANCE = 'DISTANCE',
    OPEN = 'OPEN'
}

export enum TargetType {
    HEART_RATE = 'HEART_RATE',
    POWER = 'POWER',
    SPEED = 'SPEED',
    CADENCE = 'CADENCE',
    OPEN = 'OPEN'
}


export class WorkoutStep {
    constructor(
        public durationType: DurationType,
        public durationValue: number,
        public targetType: TargetType,
        public targetLow: number = 0,
        public targetHigh: number = 0,
        public wktStepName: string,
    ) { }

    /**
     * 
     * @param step e.g.
     * {
     * "durationType": "distance",
     * "durationValue": 500000,
     * "targetType": "power3s",
     * "customTargetValueLow": 1173,
     * "customTargetValueHigh": 1269,
     * "targetValue": 0,
     * "wktStepName": "Text to display",
     * "intensity": "interval",
     * "messageIndex": 0,
     * "durationDistance": 5000
     * }
     */
    static fromGarminFitFile(step: any): WorkoutStep {
        const durationType = WorkoutStep.parseDurationType(step.durationType);
        const targetType = WorkoutStep.parseTargetType(step.targetType);

        return new WorkoutStep(
            durationType,
            step.durationValue || 0,
            targetType,
            step.customTargetValueLow || 0,
            step.customTargetValueHigh || 0,
            step.wktStepName || ''
        );

    }

    static parseDurationType(durationType: string): DurationType {
        switch (durationType.toLowerCase()) {
            case 'time':
                return DurationType.TIME;
            case 'distance':
                return DurationType.DISTANCE;
            case 'open':
                return DurationType.OPEN;
            default:
                throw new Error(`Unknown duration type: ${durationType}`);
        }
    }
    static parseTargetType(targetType: string): TargetType {
        if (targetType.toLowerCase().startsWith('power')) {
            return TargetType.POWER;
        } else if (targetType.toLowerCase().startsWith('heart')) {
            return TargetType.HEART_RATE;
        } else if (targetType.toLowerCase().startsWith('speed')) {
            return TargetType.SPEED;
        } else if (targetType.toLowerCase().startsWith('cadence')) {
            return TargetType.CADENCE;
        }
        return TargetType.OPEN;
    }
}

export class Workout {
    constructor(
        public sport: string,
        public wktName: string,
        public steps: WorkoutStep[] = []
    ) { }

    static fromGarminFitFile(workout: any): Workout {
        const steps = workout.workoutStepMesgs.map((step: any) => WorkoutStep.fromGarminFitFile(step));
        return new Workout(
            workout.sport || 'cycling',
            workout.wktName || 'Unnamed Workout',
            steps
        );
    }
}