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
        let power = event.powermeterData.power;
        if (event.powermeterData.balence === null) {
            // If balence is null, we assume the power is from the left side only
            power = power * 2; // Double the power to account for both sides
        }
        this.addValue(power, new Date(event.powermeterData.timestamp));
    }
}
