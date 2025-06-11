export class PowerMeterData {
    constructor(
        public timestamp: Date,
        public power: number,
        public balence?: number,
        public accumulatedTorque?: number,
        public cumulativeCrankRevolutions?: number,
        public lastCrankEventTimestamp?: number  // Last crank event time Uint16 in 1/1024 second
    ) { }

    public diffCrankRotations(previous: PowerMeterData): number | null {
        return this.diff(this.cumulativeCrankRevolutions, previous.cumulativeCrankRevolutions, 0xFFFFFFFF);
    }


    public diffCrankTimeInSeconds(previous: PowerMeterData): number | null {
        const diff = this.diff(this.lastCrankEventTimestamp, previous.lastCrankEventTimestamp, 0xFFFFFFFF);
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