import { LocationServiceEvent } from './LocationServiceEvent';
import { MetricService } from "../services/metric.service";
import { Util } from "../util/util";
import { Metric } from "./Metric";

export class DistanceMetric extends Metric {
    private lastLocation: GeolocationPosition | null = null;
    totalDistance: number = 0;

    constructor(metricService: MetricService) {
        super('Distance', 'm', metricService, 'km');
    }
    startLogging(): void {
        this.metricService.getLocationService().subscribeForLocation(this.locationEventHandler.bind(this));
    }

    stopLogging(): void {
        this.metricService.getLocationService().unsubscribeForLocation(this.locationEventHandler.bind(this));
    }

    locationEventHandler(event: LocationServiceEvent): void {
        const lastLat = this.lastLocation?.coords.latitude ?? null;
        const lastLon = this.lastLocation?.coords.longitude ?? null;
        const currentLat = event.location?.coords.latitude ?? null;
        const currentLon = event.location?.coords.longitude ?? null;
        if (lastLat !== null && lastLon !== null && currentLat !== null && currentLon !== null) {
            const distance = Util.haversineDistanceBetweenPoints(
                lastLat,
                lastLon,
                currentLat,
                currentLon
            );
            this.totalDistance += distance;
            this.addValue(this.totalDistance, new Date(event.location.timestamp));
        } else {
            // If this is the first location event, we can't calculate distance yet
            this.addValue(this.totalDistance, new Date(event.location.timestamp));
        }
        this.lastLocation = event.location;
    }

}
