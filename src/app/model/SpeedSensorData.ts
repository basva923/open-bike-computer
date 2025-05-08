export class SpeedSensorData {
    constructor(
        public timestamp: Date,
        public cumulativeWheelRevolutions?: number,
        public cumulativeCrankRevolutions?: number,
        public lastWheelEventTime?: Date,
        public lastCrankEventTime?: Date
    ) { }
}