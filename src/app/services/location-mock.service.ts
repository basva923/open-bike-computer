import { Injectable } from '@angular/core';
import { LocationService } from './location.service';
import { LocationServiceEvent } from '../model/LocationServiceEvent';
import { Util } from '../util/util';

@Injectable({
  providedIn: 'root'
})

export class LocationMockService extends LocationService {
  private intervalId: any;
  private route: GeolocationPosition[] = [];
  private currentIndex = 0;

  constructor() {
    super();
    this.generateRandomRoute();
  }

  protected override startListeningForLocation() {
    this.startMockRide();
  }

  private generateRandomRoute() {
    var currentLat = 50.8503; // Central Brussels latitude
    var currentLong = 4.3517; // Central Brussels longitude
    const baseTimestamp = Date.now();
    const numberOfPoints = 10000; // Number of points in the route
    const stepDistance = 0.0005; // Approx. 50 meters per step
    var currentAltitude = 1500; // Altitude in meters

    for (let i = 0; i < numberOfPoints; i++) {
      const randomLatitudeOffset = (Math.random() - 0.5) * stepDistance;
      const randomLongitudeOffset = (Math.random() - 0.5) * stepDistance;
      const heading = Util.toDegrees(Util.bearing(
        currentLat,
        currentLong,
        currentLat + randomLatitudeOffset,
        currentLong + randomLongitudeOffset
      ))
      const speed = Util.haversineDistanceBetweenPoints(
        currentLat,
        currentLong,
        currentLat + randomLatitudeOffset,
        currentLong + randomLongitudeOffset
      ) / 1; // Speed in m/s (1 second interval)
      currentLat += randomLatitudeOffset;
      currentLong += randomLongitudeOffset;
      currentAltitude += (Math.random() - 0.5) * 10; // Random altitude change

      this.route.push({
        coords: {
          latitude: currentLat,
          longitude: currentLong,
          altitude: currentAltitude,
          accuracy: 5,
          altitudeAccuracy: 5,
          heading: heading,
          speed: speed
        } as any,
        timestamp: baseTimestamp + i * 1000
      } as any);
    }
  }

  private startMockRide() {
    this.intervalId = setInterval(() => {
      if (this.currentIndex < this.route.length) {
        const mockPosition = this.route[this.currentIndex];
        this.locations.push(mockPosition);
        this.currentLocationEvent.dispatchEvent(
          new LocationServiceEvent(mockPosition)
        );
        this.currentIndex++;
      } else {
        clearInterval(this.intervalId);
      }
    }, 1000); // Simulate one location update per second
  }
}