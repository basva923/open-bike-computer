import { TestBed } from '@angular/core/testing';

import { HeartRateSensorMockService } from './heart-rate-sensor-mock.service';

describe('HeartRateSensorMockService', () => {
  let service: HeartRateSensorMockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeartRateSensorMockService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
