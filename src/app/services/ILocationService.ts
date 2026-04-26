import { LocationServiceEvent } from '../model/LocationServiceEvent';

export interface ILocationService {
    subscribeForLocation(callback: (event: LocationServiceEvent) => void): void;
    unsubscribeForLocation(callback: (event: LocationServiceEvent) => void): void;

    phoneIsPointingForward: boolean;

    readonly curCoordinates: GeolocationCoordinates | null;
    readonly curLatitude: number | null;
    readonly curLongitude: number | null;
    readonly curAltitude: number | null;
    readonly curAccuracy: number | null;
    readonly curAltitudeAccuracy: number | null;
    readonly curHeading: number | null;
    readonly curSpeed: number | null;
    readonly curTimestamp: number | null;
    readonly maxSpeed: number | null;
    readonly avgSpeed: number;
    readonly coordinatesLog: GeolocationCoordinates[];
    readonly bearingForVerticalPhone: number;
    readonly bearingForHorizontalPhone: number;
    readonly gradeForHorizontalPhone: number;
}