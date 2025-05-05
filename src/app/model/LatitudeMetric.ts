import { LocationServiceEvent } from './LocationServiceEvent';
import { MetricService } from "../services/metric.service";
import { Metric } from "./Metric";

export class LatitudeMetric extends Metric {
    private handler = this.locationEventHandler.bind(this);

    constructor(metricService: MetricService) {
        super('Latitude', '°', metricService, '°', 5);
    }

    startLogging(): void {
        this.metricService.getLocationService().subscribeForLocation(this.handler);
    }

    stopLogging(): void {
        this.metricService.getLocationService().unsubscribeForLocation(this.handler);
    }

    locationEventHandler(event: LocationServiceEvent): void {
        this.addValue(event.location.coords.latitude, new Date(event.location.timestamp));
    }

}
