export class PowerMeterData {
    constructor(
        public timestamp: Date,
        public power: number,

        // If the sensor provides the power balance referenced to the left pedal, 
        // the power balance is calculated as [LeftPower/(LeftPower + RightPower)]*100 in units of percent
        public balance?: number,
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

    public getTotalPower(): number {
        if (this.balance == undefined || this.balance === null) {
            return this.power;
        }
        const balence = this.balance / 100;
        return this.power * (1 / balence);
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