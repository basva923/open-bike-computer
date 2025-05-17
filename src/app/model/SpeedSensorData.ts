export class SpeedSensorData {
    constructor(
        public timestamp: Date,
        public cumulativeWheelRevolutions?: number, // Cumulative wheel revolutions Uint32
        public cumulativeCrankRevolutions?: number, // Cumulative crank revolutions Uint16
        public lastWheelEventTime?: number, // Last wheel event time Uint16 in 1/1024 second
        public lastCrankEventTime?: number // Last crank event time Uint16 in 1/1024 second
    ) { }

    public diffWheelRevolutions(previous: SpeedSensorData): number | null {
        return this.diff(this.cumulativeWheelRevolutions, previous.cumulativeWheelRevolutions, 0xFFFFFFFF);
    }

    public diffCrankRevolutions(previous: SpeedSensorData): number | null {
        return this.diff(this.cumulativeCrankRevolutions, previous.cumulativeCrankRevolutions, 0xFFFF);
    }

    public diffWheelTimeInSeconds(previous: SpeedSensorData): number | null {
        const diff = this.diff(this.lastWheelEventTime, previous.lastWheelEventTime, 0xFFFF)
        if (diff === null) {
            return null;
        }
        return diff / 1024;
    }
    public diffCrankTimeInSeconds(previous: SpeedSensorData): number | null {
        const diff = this.diff(this.lastCrankEventTime, previous.lastCrankEventTime, 0xFFFF);
        if (diff === null) {
            return null;
        }
        return diff / 1024;
    }

    private diff(biggest: number | undefined, smallest: number | undefined, maxValue: number): number | null {
        if (biggest === undefined || smallest === undefined) {
            return null;
        }
        if (biggest < smallest) {
            return (biggest + maxValue) - smallest;
        }
        return biggest - smallest;
    }
}
