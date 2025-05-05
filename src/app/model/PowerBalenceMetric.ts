import { MetricService } from "../services/metric.service";
import { Metric } from "./Metric";
import { PowerMeterServiceEvent } from "./PowerMeterServiceEvent";

export class PowerBalenceMetric extends Metric {
    private handler = this.handlePowerMeterEvent.bind(this);

    constructor(metricService: MetricService) {
        super('Power Balence', '%', metricService, '%', 2);
    }

    startLogging(): void {
        this.metricService.getPowerMeterService().subscribeForPowerData(this.handler);
    }


    stopLogging(): void {
        this.metricService.getPowerMeterService().unsubscribeForPowerData(this.handler);
    }

    handlePowerMeterEvent(event: PowerMeterServiceEvent): void {
        if (event.powermeterDate.balence) {
            this.addValue(event.powermeterDate.balence, new Date(event.powermeterDate.timestamp));
        }
    }
}
