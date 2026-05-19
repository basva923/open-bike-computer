import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the footer popup from the button', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.footer-toggle button');

    expect(fixture.nativeElement.querySelector('.footer-popup')).toBeNull();
    expect(button.getAttribute('aria-label')).toBe('Open footer popup');

    button.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.footer-popup')).not.toBeNull();
    expect(button.getAttribute('aria-label')).toBe('Close footer popup');

    button.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.footer-popup')).toBeNull();
    expect(button.getAttribute('aria-label')).toBe('Open footer popup');
  });
});
