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
        public targetLow: number | null = null,
        public targetHigh: number | null = null,
        public name: string,
    ) { }

    displayValue(value: number | null): string {
        if (this.targetType === TargetType.OPEN) {
            return 'Open';
        }
        if (this.targetType === TargetType.POWER) {
            return `${value}W`;
        }
        if (this.targetType === TargetType.HEART_RATE) {
            return `${value}bpm`;
        }
        if (this.targetType === TargetType.SPEED) {
            return `${value}m/s`;
        }
        if (this.targetType === TargetType.CADENCE) {
            return `${value}rpm`;
        }
        return 'N/A';
    }


    displayTargetLow(): string {
        return this.displayValue(this.targetLow);
    }
    displayTargetHigh(): string {
        return this.displayValue(this.targetHigh);
    }
    displayDuration(): string {
        if (this.durationType === DurationType.TIME) {
            const minutes = Math.floor(this.durationValue / 60);
            const seconds = Math.floor((this.durationValue % 60));
            return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        } else if (this.durationType === DurationType.DISTANCE) {
            const kilometers = this.durationValue;
            return `${kilometers} km`;
        } else if (this.durationType === DurationType.OPEN) {
            return 'Open';
        } else {
            throw new Error(`Unknown duration type: ${this.durationType}`);
        }
    }

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
            step.durationValue / 1000 || 0,
            targetType,
            this.parseCustomTargetValue(targetType, step.customTargetValueLow),
            this.parseCustomTargetValue(targetType, step.customTargetValueHigh),
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

    static parseCustomTargetValue(targetType: TargetType, value: number): number | null {
        if (!value || value <= 0) {
            return null;
        }
        switch (targetType) {
            case TargetType.POWER:
                if (value < 1000) {
                    throw new Error("Relative power target not supported");
                }
                return value - 1000;
            case TargetType.HEART_RATE:
                if (value < 100) {
                    throw new Error("Relative heart rate target not supported");
                }
                return value - 100; // Convert to bpm
            case TargetType.SPEED:
                return value; // Speed is already in m/s
            case TargetType.CADENCE:
                return value; // Cadence is already in rpm
            default:
                return 0; // For OPEN or unknown types, return 0
        }
    }
}

export class Workout {
    constructor(
        public sport: string,
        public name: string,
        public steps: WorkoutStep[] = []
    ) { }

    static fromGarminFitFile(workout: any): Workout {
        const steps = workout.workoutStepMesgs.map((step: any) => WorkoutStep.fromGarminFitFile(step));
        return new Workout(
            workout.workoutMesgs[0]?.sport || 'cycling',
            workout.workoutMesgs[0]?.wktName || 'Unnamed Workout',
            steps
        );
    }
}