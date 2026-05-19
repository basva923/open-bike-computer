import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapLibreMapComponent } from './maplibre-map.component';
import { ServiceFactory } from '../services/ServiceFactory';
import { LocationServiceEvent } from '../model/LocationServiceEvent';

describe('MapboxMapComponent', () => {
  let component: MapLibreMapComponent;
  let fixture: ComponentFixture<MapLibreMapComponent>;
  let locationService: any;
  let navigationService: any;

  beforeEach(async () => {
    locationService = {
      curLatitude: 1,
      curLongitude: 2,
      bearingForHorizontalPhone: 45,
      coordinatesLog: [{ longitude: 2, latitude: 1 }],
      subscribeForLocation: jasmine.createSpy('subscribeForLocation'),
      unsubscribeForLocation: jasmine.createSpy('unsubscribeForLocation'),
    };
    navigationService = {
      hasRoute: () => false,
      getRoute: () => [],
      addNewRouteListener: jasmine.createSpy('addNewRouteListener'),
      removeNewRouteListener: jasmine.createSpy('removeNewRouteListener'),
    };
    spyOn(ServiceFactory, 'getLocationService').and.returnValue(locationService);
    spyOn(ServiceFactory, 'getNavigationService').and.returnValue(navigationService);
    await TestBed.configureTestingModule({
      imports: [MapLibreMapComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MapLibreMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('throttles live map updates to once per second', () => {
    const source = { setData: jasmine.createSpy('setData') };
    const map = {
      getSource: jasmine.createSpy('getSource').and.returnValue(source),
      getBearing: jasmine.createSpy('getBearing').and.returnValue(0),
      setLayoutProperty: jasmine.createSpy('setLayoutProperty'),
      setCenter: jasmine.createSpy('setCenter'),
      setBearing: jasmine.createSpy('setBearing'),
    };
    component.map = map as any;
    const event = new LocationServiceEvent({
      coords: { longitude: 2, latitude: 1 },
    } as GeolocationPosition);
    let now = 1000;
    spyOn(Date, 'now').and.callFake(() => now);

    (component as any).handleLocationUpdate(event);
    now = 1500;
    (component as any).handleLocationUpdate(event);
    now = 2000;
    (component as any).handleLocationUpdate(event);

    expect(map.setCenter).toHaveBeenCalledTimes(2);
    expect(map.setLayoutProperty).toHaveBeenCalledTimes(2);
  });

  it('removes map event listeners when destroyed', () => {
    component.mapCreated({} as any);

    component.ngOnDestroy();

    expect(locationService.unsubscribeForLocation).toHaveBeenCalledWith(jasmine.any(Function));
    expect(navigationService.removeNewRouteListener).toHaveBeenCalledWith(jasmine.any(Function));
  });
});
