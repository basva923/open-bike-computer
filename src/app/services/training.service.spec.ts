import { TestBed } from '@angular/core/testing';

import { TrainingService } from './training.service';

describe('TrainingService', () => {
  let service: TrainingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('checks workout progress at most once per second', () => {
    const setIntervalSpy = spyOn(window, 'setInterval').and.returnValue(1);
    const clearIntervalSpy = spyOn(window, 'clearInterval');

    (service as any).startCheckInterval();

    expect(setIntervalSpy).toHaveBeenCalledWith(jasmine.any(Function), 1000);

    (service as any).stopCheckInterval();
    expect(clearIntervalSpy).toHaveBeenCalledWith(1);
  });
});
