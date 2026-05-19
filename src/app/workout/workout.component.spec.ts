import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutComponent } from './workout.component';
import { ChangeDetectorRef } from '@angular/core';

describe('WorkoutComponent', () => {
  let component: WorkoutComponent;
  let fixture: ComponentFixture<WorkoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('refreshes workout display once per second', () => {
    const setIntervalSpy = spyOn(window, 'setInterval').and.returnValue(1);
    const component = new WorkoutComponent({ detectChanges: () => { } } as ChangeDetectorRef);

    component.ngOnInit();

    expect(setIntervalSpy).toHaveBeenCalledWith(jasmine.any(Function), 1000);
    component.ngOnDestroy();
  });

  it('skips display refresh while the page is hidden', () => {
    spyOn(window, 'setInterval').and.returnValue(1);
    spyOnProperty(document, 'hidden', 'get').and.returnValue(true);
    const cdr = { detectChanges: jasmine.createSpy('detectChanges') };
    const component = new WorkoutComponent(cdr as any);

    component.ngOnInit();

    expect(cdr.detectChanges).not.toHaveBeenCalled();
    component.ngOnDestroy();
  });
});
