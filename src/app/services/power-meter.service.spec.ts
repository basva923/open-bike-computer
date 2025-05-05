import { TestBed } from '@angular/core/testing';

import { PowerMeterService } from './power-meter.service';

describe('PowerMeterService', () => {
  let service: PowerMeterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PowerMeterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
