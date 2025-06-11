import { MetricService } from "../services/metric.service";
import { Metric, MetricType } from "./Metric";
import { PowerMeterData } from "./PowerMeterData";
import { PowerMeterServiceEvent } from "./PowerMeterServiceEvent";

export class CadenceMetric extends Metric {
    private handler = this.handlePowerMeterEvent.bind(this);
    private lastPowerMeterDatas: PowerMeterData[] = [];

    constructor(metricService: MetricService) {
        super(MetricType.CADENCE, 'Cadence', 'rpm', metricService);
    }


    startLogging(): void {
        this.metricService.getPowerMeterService().subscribeForPowerData(this.handler);
    }


    stopLogging(): void {
        this.metricService.getPowerMeterService().unsubscribeForPowerData(this.handler);
    }

    handlePowerMeterEvent(event: PowerMeterServiceEvent): void {
        if (!event.powermeterData.cumulativeCrankRevolutions) {
            return;
        }

        const lastDataWithLessCrankRevolutions = this.getLastPowerMeterDataWithLessCrankRevolutions(event.powermeterData.cumulativeCrankRevolutions);
        if (lastDataWithLessCrankRevolutions === null) {
            this.addValue(0, new Date(event.powermeterData.timestamp));
        } else {
            const diffRotations = event.powermeterData.diffCrankRotations(lastDataWithLessCrankRevolutions) || 0;
            const timediff = event.powermeterData.diffCrankTimeInSeconds(lastDataWithLessCrankRevolutions) || 1;
            const speed = diffRotations / timediff; // in m/s

            this.addValue(speed, event.powermeterData.timestamp);
        }
        this.lastPowerMeterDatas.push(event.powermeterData);
        if (this.lastPowerMeterDatas.length > 10) {
            this.lastPowerMeterDatas.shift();
        }
    }

    getLastPowerMeterDataWithLessCrankRevolutions(cumulativeCrankRevolutions: number): PowerMeterData | null {
        for (let i = this.lastPowerMeterDatas.length - 1; i >= 0; i--) {
            const data = this.lastPowerMeterDatas[i];
            if (data.cumulativeCrankRevolutions && data.cumulativeCrankRevolutions < cumulativeCrankRevolutions) {
                return data;
            }
        }
        return null;
    }
}
