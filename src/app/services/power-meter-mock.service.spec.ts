import { TestBed } from '@angular/core/testing';

import { PowerMeterMockService } from './power-meter-mock.service';

describe('PowerMeterMockService', () => {
  let service: PowerMeterMockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PowerMeterMockService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
