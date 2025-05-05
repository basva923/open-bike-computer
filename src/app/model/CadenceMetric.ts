import { MetricService } from "../services/metric.service";
import { Metric } from "./Metric";
import { PowerMeterServiceEvent } from "./PowerMeterServiceEvent";

export class CadenceMetric extends Metric {
    private handler = this.handlePowerMeterEvent.bind(this);
    constructor(metricService: MetricService) {
        super('Cadence', 'rpm', metricService);
    }


    startLogging(): void {
        this.metricService.getPowerMeterService().subscribeForPowerData(this.handler);
    }


    stopLogging(): void {
        this.metricService.getPowerMeterService().unsubscribeForPowerData(this.handler);
    }

    handlePowerMeterEvent(event: PowerMeterServiceEvent): void {
        if (event.powermeterDate.cadence) {
            this.addValue(event.powermeterDate.cadence, new Date(event.powermeterDate.timestamp));
        }
    }
}
