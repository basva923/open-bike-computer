import { LocationServiceEvent } from './LocationServiceEvent';
import { MetricService } from "../services/metric.service";
import { Util } from "../util/util";
import { Metric, MetricType } from "./Metric";

export class DistanceMetric extends Metric {
    private lastLocation: GeolocationPosition | null = null;
    totalDistance: number = 0;
    private handler = this.locationEventHandler.bind(this);

    constructor(metricService: MetricService) {
        super(MetricType.DISTANCE, 'Distance', 'm', metricService, 'km', 2);
    }
    startLogging(): void {
        this.metricService.getLocationService().subscribeForLocation(this.handler);
    }

    stopLogging(): void {
        this.metricService.getLocationService().unsubscribeForLocation(this.handler);
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
