import { PowerMeterData } from "./PowerMeterData";


export class PowerMeterServiceEvent extends Event {


    constructor(public powermeterData: PowerMeterData) {
        super('powerMeterServiceEvent');
    }
}
