
export class HeartReateData {
    timestamp: Date;
    heartRate: number;
    contactDetected?: boolean;
    energyExpended?: number;
    rrIntervals?: number[];

    constructor(timestamp: Date, heartRate: number, contactDetected?: boolean, energyExpended?: number, rrIntervals?: number[]) {
        this.timestamp = timestamp;
        this.heartRate = heartRate;
        this.contactDetected = contactDetected;
        this.energyExpended = energyExpended;
        this.rrIntervals = rrIntervals;
    }
}
