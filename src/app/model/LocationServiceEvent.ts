
export class LocationServiceEvent extends Event {
    location: GeolocationPosition;

    constructor(location: GeolocationPosition) {
        super('newLocation');
        this.location = location;
    }
}
