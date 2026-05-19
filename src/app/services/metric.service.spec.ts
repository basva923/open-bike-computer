import { TestBed } from '@angular/core/testing';

import { MetricService } from './metric.service';
import { MetricType } from '../model/Metric';

describe('MetricService', () => {
  let service: MetricService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetricService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('registers one metric for each metric type', () => {
    const names = service.getNames();
    const uniqueNames = new Set(names);

    expect(names.length).toBe(Object.values(MetricType).length);
    expect(uniqueNames.size).toBe(names.length);
  });
});
