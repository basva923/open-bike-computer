import { PowerMeterData } from "./PowerMeterData";


export class PowerMeterServiceEvent extends Event {


    constructor(public powermeterDate: PowerMeterData) {
        super('powerMeterServiceEvent');
    }
}
