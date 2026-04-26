import { LocationServiceEvent } from './LocationServiceEvent';
import { MetricService } from "../services/metric.service";
import { Metric, MetricType } from "./Metric";

export class AltitudeMetric extends Metric {
    private handler = this.locationEventHandler.bind(this);

    constructor(metricService: MetricService) {
        super(MetricType.ALTITUDE, 'Altitude', 'm', metricService);
    }

    startLogging(): void {
        this.metricService.getLocationService().subscribeForLocation(this.handler);
    }

    stopLogging(): void {
        this.metricService.getLocationService().unsubscribeForLocation(this.handler);
    }

    locationEventHandler(event: LocationServiceEvent): void {
        const altitude = event.location.coords.altitude;
        if (altitude !== null) {
            this.addValue(altitude, new Date(event.location.timestamp));
        }
    }
}
