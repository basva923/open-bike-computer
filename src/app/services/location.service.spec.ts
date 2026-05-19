import { TestBed } from '@angular/core/testing';

import { LocationService } from './location.service';

describe('LocationService', () => {
  let service: LocationService;
  let watchPositionSpy: jasmine.Spy;

  beforeEach(() => {
    watchPositionSpy = spyOn(navigator.geolocation, 'watchPosition').and.returnValue(1);
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('uses cached lower accuracy geolocation options to reduce GPS battery drain', () => {
    expect(watchPositionSpy).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.any(Function),
      jasmine.objectContaining({
        enableHighAccuracy: false,
        maximumAge: 5000,
        timeout: 10000,
      })
    );
  });
});
