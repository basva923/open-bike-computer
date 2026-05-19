import { MetricService } from "../services/metric.service";
import { Metric, MetricType } from "./Metric";
import { PowerMeterServiceEvent } from "./PowerMeterServiceEvent";

export class PowerBalenceMetric extends Metric {
    private handler = this.handlePowerMeterEvent.bind(this);

    constructor(metricService: MetricService) {
        super(MetricType.POWER_BALENCE, 'Power Balence', '%', metricService, '%', 0);
    }

    startLogging(): void {
        this.metricService.getPowerMeterService().subscribeForPowerData(this.handler);
    }


    stopLogging(): void {
        this.metricService.getPowerMeterService().unsubscribeForPowerData(this.handler);
    }

    handlePowerMeterEvent(event: PowerMeterServiceEvent): void {
        if (event.powermeterData.balance) {
            this.addValue(event.powermeterData.balance, new Date(event.powermeterData.timestamp));
        }
    }
}
