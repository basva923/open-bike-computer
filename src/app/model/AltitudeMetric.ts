import { LocationServiceEvent } from "../services/location.service";
import { MetricService } from "../services/metric.service";
import { Metric } from "./Metric";

export class AltitudeMetric extends Metric {
    constructor(metricService: MetricService) {
        super('Altitude', 'm', metricService);
    }

    startLogging(): void {
        this.metricService.getLocationService().subscribeForLocation(this.locationEventHandler.bind(this));
    }

    stopLogging(): void {
        this.metricService.getLocationService().unsubscribeForLocation(this.locationEventHandler.bind(this));
    }

    locationEventHandler(event: LocationServiceEvent): void {
        const altitude = event.location.coords.altitude;
        if (altitude !== null) {
            this.addValue(altitude, new Date(event.location.timestamp));
        }
    }
}
