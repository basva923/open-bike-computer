import { HeartReateData } from "./HeartReateData";


export class HeartRateSensorServiceEvent extends Event {
    constructor(public heartRate: HeartReateData) {
        super('heartRateSensorServiceEvent');
    }
}
