export class PowerMeterData {
    constructor(
        public timestamp: Date,
        public power: number,
        public balence?: number,
        public cadence?: number,
        // public speed?: number,
        public accumulatedTorque?: number,
        // public cumulativeWheelRotations?: number,
        public cumulativeCrankRevolutions?: number,
    ) { }
}