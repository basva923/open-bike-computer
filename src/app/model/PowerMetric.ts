import { MetricService } from "../services/metric.service";
import { Metric, MetricType } from "./Metric";
import { PowerMeterServiceEvent } from "./PowerMeterServiceEvent";

export class PowerMetric extends Metric {
    private handler = this.handlePowerMeterEvent.bind(this);

    constructor(metricService: MetricService) {
        super(MetricType.POWER, 'Power', 'W', metricService);
    }

    startLogging(): void {
        this.metricService.getPowerMeterService().subscribeForPowerData(this.handler);
    }


    stopLogging(): void {
        this.metricService.getPowerMeterService().unsubscribeForPowerData(this.handler);
    }

    handlePowerMeterEvent(event: PowerMeterServiceEvent): void {
        this.addValue(event.powermeterDate.power, new Date(event.powermeterDate.timestamp));
    }
}
