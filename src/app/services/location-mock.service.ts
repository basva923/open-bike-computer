import { Injectable } from '@angular/core';
import { LocationService } from './location.service';
import { LocationServiceEvent } from '../model/LocationServiceEvent';

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
          heading: Math.random() * 360,
          speed: 5 + Math.random() * 2
        },
        timestamp: baseTimestamp + i * 1000
      });
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