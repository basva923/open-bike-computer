import { TestBed } from '@angular/core/testing';

import { LocationMockService } from './location-mock.service';

describe('LocationServiceMockService', () => {
  let service: LocationMockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocationMockService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
