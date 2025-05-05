import { LocationServiceEvent } from './LocationServiceEvent';
import { MetricService } from "../services/metric.service";
import { Metric } from "./Metric";

export class VerticalSpeedMetric extends Metric {

    protected lastLocation: GeolocationPosition | null = null;
    private handler = this.locationEventHandler.bind(this);

    constructor(metricService: MetricService) {
        super('Vertical Speed', 'm/s', metricService);
    }

    startLogging(): void {
        this.metricService.getLocationService().subscribeForLocation(this.handler);
    }

    stopLogging(): void {
        this.metricService.getLocationService().unsubscribeForLocation(this.handler);
    }

    locationEventHandler(event: LocationServiceEvent): void {
        const lastAltitude = this.lastLocation?.coords?.altitude ?? null;
        const currentAltitude = event.location?.coords?.altitude ?? null;
        if (lastAltitude !== null && currentAltitude !== null) {
            const distance = currentAltitude - lastAltitude;
            const time = (event.location.timestamp - this.lastLocation!.timestamp) / 1000.0; // convert to seconds
            const verticalSpeed = distance / time;
            this.addValue(verticalSpeed, new Date(event.location.timestamp));
        } else {
            // If this is the first location event, we can't calculate vertical speed yet
            this.addValue(0, new Date(event.location.timestamp));
        }
        this.lastLocation = event.location;
    }
}
