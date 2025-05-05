import { LocationServiceEvent } from './LocationServiceEvent';
import { MetricService } from "../services/metric.service";
import { Util } from "../util/util";
import { Metric } from "./Metric";

export class GradeMetric extends Metric {
    private lastLocation: GeolocationPosition | null = null;

    constructor(metricService: MetricService) {
        super('Grade', '%', metricService);
    }


    startLogging(): void {
        this.metricService.getLocationService().subscribeForLocation(this.locationEventHandler.bind(this));
    }

    stopLogging(): void {
        this.metricService.getLocationService().unsubscribeForLocation(this.locationEventHandler.bind(this));
    }

    locationEventHandler(event: LocationServiceEvent): void {
        const lastAltitude = this.lastLocation?.coords?.altitude ?? null;
        const currentAltitude = event.location?.coords?.altitude ?? null;
        const lastLatitude = this.lastLocation?.coords?.latitude ?? null;
        const currentLatitude = event.location?.coords?.latitude ?? null;
        const lastLongitude = this.lastLocation?.coords?.longitude ?? null;
        const currentLongitude = event.location?.coords?.longitude ?? null;
        if (lastLatitude !== null && lastLongitude !== null && currentLatitude !== null && currentLongitude !== null &&
            lastAltitude !== null && currentAltitude !== null) {
            const distance = Util.haversineDistanceBetweenPoints(
                lastLatitude,
                lastLongitude,
                currentLatitude,
                currentLongitude
            );
            const verticalDistance = currentAltitude - lastAltitude;
            const grade = (verticalDistance / distance) * 100; // Convert to percentage
            this.addValue(grade, new Date(event.location.timestamp));
        }
        else {
            // If this is the first location event, we can't calculate vertical speed yet
            this.addValue(0, new Date(event.location.timestamp));
        }
        this.lastLocation = event.location;
    }

}
