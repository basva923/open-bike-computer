import { Injectable } from '@angular/core';
import { LocationServiceEvent } from '../model/LocationServiceEvent';
import { ILocationService } from './ILocationService';

@Injectable({
  providedIn: 'root',
})
export class LocationService implements ILocationService {
  protected locations: GeolocationPosition[] = [];
  public currentLocationEvent = new EventTarget();
  private absolute = false;
  private alpha: number = 0;
  private beta: number = 0;
  private gamma: number = 0;

  private reversedPhone = false;

  // Straight-line detection: skip GPS updates when heading is stable
  private lastDispatchedHeading: number | null = null;
  private lastDispatchedTime: number = 0;
  private static readonly HEADING_THRESHOLD_DEG = 5; // degrees of heading change to trigger update
  private static readonly MAX_SKIP_INTERVAL_MS = 5000; // force update at least every 5 seconds
  private static readonly MAX_LOCATIONS = 10000; // cap stored locations to limit memory
  private static readonly LOCATIONS_TRIM_THRESHOLD = 11000; // only trim when exceeding this to avoid frequent reallocations
  private static readonly MIN_LOCATIONS_FOR_BASELINE = 3; // minimum locations needed before heading-based throttling
  private static readonly WATCH_OPTIONS: PositionOptions = {
    enableHighAccuracy: false,
    maximumAge: 5000,
    timeout: 10000,
  };

  constructor() {
    this.startListeningForLocation();
  }

  protected startListeningForLocation() {
    // start gps watch
    navigator.geolocation.watchPosition(
      (position) => {
        if (this.shouldDispatchUpdate(position)) {
          this.locations.push(position);
          // Cap stored locations to prevent unbounded memory growth
          // Only trim when significantly over the limit to avoid frequent array copies
          if (this.locations.length > LocationService.LOCATIONS_TRIM_THRESHOLD) {
            this.locations = this.locations.slice(-LocationService.MAX_LOCATIONS);
          }
          this.currentLocationEvent.dispatchEvent(new LocationServiceEvent(position));
          this.lastDispatchedHeading = position.coords.heading;
          this.lastDispatchedTime = Date.now();
        }
      },
      (error) => {
        console.error(error);
      },
      LocationService.WATCH_OPTIONS
    );

    window.addEventListener(
      'deviceorientationabsolute',
      (e) => this.handleOrientationChange(e),
      { capture: true, passive: true }
    );
  }

  /**
   * Determines whether a GPS update should be dispatched based on heading change.
   * When riding in a straight line (stable heading), updates are skipped to save battery.
   * Updates are always dispatched if:
   * - It's the first location
   * - The heading has changed beyond the threshold
   * - The max skip interval has been exceeded
   */
  private shouldDispatchUpdate(position: GeolocationPosition): boolean {
    const now = Date.now();

    // Always dispatch the first few locations to establish baseline
    if (this.locations.length < LocationService.MIN_LOCATIONS_FOR_BASELINE) {
      return true;
    }

    // Always dispatch if max interval exceeded
    if (now - this.lastDispatchedTime >= LocationService.MAX_SKIP_INTERVAL_MS) {
      return true;
    }

    // If heading is available, check if direction changed significantly
    const currentHeading = position.coords.heading;
    if (currentHeading !== null && this.lastDispatchedHeading !== null) {
      const headingDiff = Math.abs(currentHeading - this.lastDispatchedHeading);
      // Normalize for 360° wraparound
      const normalizedDiff = headingDiff > 180 ? 360 - headingDiff : headingDiff;
      if (normalizedDiff < LocationService.HEADING_THRESHOLD_DEG) {
        return false; // Heading stable, skip this update
      }
    }

    return true;
  }

  handleOrientationChange(event: DeviceOrientationEvent) {
    this.absolute = event.absolute;
    if (event.alpha != null) this.alpha = event.alpha;
    if (event.beta != null) this.beta = event.beta;
    if (event.gamma != null) this.gamma = event.gamma;
  }

  get gradeForHorizontalPhone() {
    return this.beta;
  }

  get bearingForVerticalPhone() {
    // Convert degrees to radians
    var alphaRad = this.alpha * (Math.PI / 180);
    var betaRad = this.beta * (Math.PI / 180);
    var gammaRad = this.gamma * (Math.PI / 180);

    // Calculate equation components
    var cA = Math.cos(alphaRad);
    var sA = Math.sin(alphaRad);
    var cB = Math.cos(betaRad);
    var sB = Math.sin(betaRad);
    var cG = Math.cos(gammaRad);
    var sG = Math.sin(gammaRad);

    // Calculate A, B, C rotation components
    var rA = -cA * sG - sA * sB * cG;
    var rB = -sA * sG + cA * sB * cG;
    var rC = -cB * cG;

    // Calculate compass heading
    var compassHeading = Math.atan(rA / rB);

    // Convert from half unit circle to whole unit circle
    if (rB < 0) {
      compassHeading += Math.PI;
    } else if (rA < 0) {
      compassHeading += 2 * Math.PI;
    }

    if (this.reversedPhone) {
      compassHeading += compassHeading >= Math.PI ? -Math.PI : Math.PI;
    }
    // Convert radians to degrees
    compassHeading *= 180 / Math.PI;
    return compassHeading;
  }

  get bearingForHorizontalPhone() {
    return (360 - this.alpha);
  }

  public subscribeForLocation(
    callback: (event: LocationServiceEvent) => void
  ) {
    this.currentLocationEvent.addEventListener('newLocation', callback as any);
  }

  public unsubscribeForLocation(callback: (event: LocationServiceEvent) => void) {
    this.currentLocationEvent.removeEventListener('newLocation', callback as any);
  }

  set phoneIsPointingForward(pointingForward: boolean) {
    this.reversedPhone = !pointingForward;
  }

  get phoneIsPointingForward() {
    return !this.reversedPhone;
  }

  get curCoordinates(): GeolocationCoordinates | null {
    return this.locations[this.locations.length - 1]?.coords || null;
  }

  get curLatitude(): number | null {
    return this.curCoordinates?.latitude || null;
  }

  get curLongitude(): number | null {
    return this.curCoordinates?.longitude || null;
  }

  get curAltitude(): number | null {
    return this.curCoordinates?.altitude || null;
  }

  get curAccuracy(): number | null {
    return this.curCoordinates?.accuracy || null;
  }

  get curAltitudeAccuracy(): number | null {
    return this.curCoordinates?.altitudeAccuracy || null;
  }

  get curHeading(): number | null {
    return this.curCoordinates?.heading || null;
  }

  get curSpeed(): number | null {
    return this.curCoordinates?.speed || null;
  }

  get curTimestamp(): number | null {
    return this.locations[this.locations.length - 1]?.timestamp || null;
  }

  get maxSpeed(): number | null {
    let maxSpeed = 0;
    for (let i = 1; i < this.locations.length; i++) {
      const speed = this.locations[i].coords.speed || 0;
      if (speed > maxSpeed) {
        maxSpeed = speed;
      }
    }
    return maxSpeed;
  }

  get avgSpeed(): number {
    if (this.locations.length === 0) {
      return 0;
    }
    let sumSpeed = 0;
    for (let i = 1; i < this.locations.length; i++) {
      sumSpeed += this.locations[i].coords.speed || 0;
    }
    return sumSpeed / this.locations.length;
  }

  get coordinatesLog(): GeolocationCoordinates[] {
    return this.locations.map((location) => location.coords);
  }
}
