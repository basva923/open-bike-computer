import { LocationServiceEvent } from "../services/location.service";
import { MetricService } from "../services/metric.service";
import { Metric } from "./Metric";

export class LongitudeMetric extends Metric {
    constructor(metricService: MetricService) {
        super('Longitude', '°', metricService);
    }

    startLogging(): void {
        this.metricService.getLocationService().subscribeForLocation(this.locationEventHandler.bind(this));
    }

    stopLogging(): void {
        this.metricService.getLocationService().unsubscribeForLocation(this.locationEventHandler.bind(this));
    }

    locationEventHandler(event: LocationServiceEvent): void {
        this.addValue(event.location.coords.longitude, new Date(event.location.timestamp));
    }
}
