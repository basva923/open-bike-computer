import { LocationServiceEvent } from "../services/location.service";
import { MetricService } from "../services/metric.service";
import { Metric } from "./Metric";

export class SpeedMetric extends Metric {
    constructor(metricService: MetricService) {
        super('Speed', 'm/s', metricService, 'km/h');
    }

    startLogging(): void {
        this.metricService.getLocationService().subscribeForLocation(this.locationEventHandler.bind(this));
    }

    stopLogging(): void {
        this.metricService.getLocationService().unsubscribeForLocation(this.locationEventHandler.bind(this));
    }

    locationEventHandler(event: LocationServiceEvent): void {
        const speed = event.location.coords.speed;
        if (speed !== null) {
            this.addValue(speed, new Date(event.location.timestamp));
        } else {
            // If speed is null, we can set it to 0 or handle it as needed
            this.addValue(0, new Date(event.location.timestamp));
        }
    }
}
