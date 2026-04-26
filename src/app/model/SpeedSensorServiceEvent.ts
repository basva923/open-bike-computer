import { SpeedSensorData } from "./SpeedSensorData";


export class SpeedSensorServiceEvent extends Event {


    constructor(public speedSensorData: SpeedSensorData) {
        super('speedSensorServiceEvent');
    }
}
