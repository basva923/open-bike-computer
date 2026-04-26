import { TestBed } from '@angular/core/testing';

import { HeartRateSensorService } from './heart-rate-sensor.service';

describe('HeartRateSensorService', () => {
  let service: HeartRateSensorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeartRateSensorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
