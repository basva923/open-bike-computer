import { Component } from '@angular/core';
import { LngLatLike, Map, MapMouseEvent, MapTouchEvent, NavigationControl } from 'maplibre-gl';
import { LocationService } from '../services/location.service';
import { ServiceFactory } from '../services/ServiceFactory';
import { LocationServiceEvent } from '../model/LocationServiceEvent';
import { Util } from '../util/util';
import {
  AttributionControlDirective,
  ControlComponent,
  FullscreenControlDirective,
  GeolocateControlDirective,
  MapComponent,
  NavigationControlDirective,
  MarkerComponent,
  Position,
  ScaleControlDirective,
  ImageComponent
} from '@maplibre/ngx-maplibre-gl';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NavigationService, NewRouteEvent } from '../services/navigation.service';


@Component({
  selector: 'app-maplibre-map',
  standalone: true,
  imports: [

    MapComponent,
    ControlComponent,
    MatButtonModule,
    AttributionControlDirective,
    FullscreenControlDirective,
    GeolocateControlDirective,
    NavigationControlDirective,
    ScaleControlDirective,
    MarkerComponent,
    ImageComponent,
    MatIconModule

  ],
  templateUrl: './maplibre-map.component.html',
  styleUrl: './maplibre-map.component.css'
})
export class MapLibreMapComponent {
  map: Map | null = null;
  private locationService: LocationService;
  private navigationService: NavigationService
  protected center: LngLatLike = [0, 0];
  protected zoom: [number] = [12];
  protected northUp = true;
  protected mapRotated = false;
  protected newRouteHandler = this.handleNewRoute.bind(this);

  moved: boolean = false;

  constructor() {
    this.locationService = ServiceFactory.getLocationService();
    this.navigationService = ServiceFactory.getNavigationService();
    if (this.locationService.curLatitude && this.locationService.curLongitude) {
      this.center = [
        this.locationService.curLongitude,
        this.locationService.curLatitude,
      ];
    }
  }

  mapCreated(map: Map) {
    console.log('Map created');
    this.map = map;
    if (this.map) {
      this.locationService.subscribeForLocation((locationEvent: LocationServiceEvent) => {
        this.updateBearing(locationEvent);
        this.updateCurrentLocation(locationEvent);
        this.updateCenter(locationEvent);
        this.updateTrack(locationEvent);
      });
      this.navigationService.addNewRouteListener(this.newRouteHandler);
    }
  }

  updateTrack(locationEvent: LocationServiceEvent) {
    if (!this.map?.getSource('track-log')) {
      this.addTrackLayer();
    }
    (this.map?.getSource('track-log') as any)?.setData(this.trackData);
  }

  updateCurrentLocation(locationEvent: LocationServiceEvent) {
    if (!this.map?.getSource('current-location')) {
      this.addCurrentLocationMarker();
    }
    (this.map?.getSource('current-location') as any)?.setData(this.currentLocationData);
    const rotation = Util.normaliseDegrees(this.locationService.bearingForHorizontalPhone - this.map?.getBearing()!);
    this.map?.setLayoutProperty('current-location', 'icon-rotate', rotation);
  }

  updateCenter(locationEvent: LocationServiceEvent) {
    if (!this.moved) {
      this.center = [
        locationEvent.location.coords.longitude,
        locationEvent.location.coords.latitude
      ];
      this.map?.setCenter(this.center);
    }
  }

  updateBearing(locationEvent: LocationServiceEvent) {
    if (this.map && !this.northUp && !this.mapRotated) {
      this.map.setBearing(this.locationService.bearingForHorizontalPhone);
    }
  }

  toggleNorth() {
    this.mapRotated = false;
    this.northUp = !this.northUp;
    if (this.northUp) {
      this.map?.setBearing(0);
    } else {
      this.map?.setBearing(this.locationService.bearingForHorizontalPhone);
    }
  }

  handleNewRoute(event: NewRouteEvent) {
    if (!this.map) {
      return;
    }
    this.map.removeLayer('track-log');
    this.map.removeSource('track-log');

    this.map.addSource('track-log', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: event.route.map((point) => {
            return point.LngLat;
          }),
        },
      }
    });
    this.map.addLayer({
      id: 'track-log',
      type: 'line',
      source: 'track-log',
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        'line-color': '#0000ff',
        'line-width': 4
      }
    });
  }


  zoomIn() {
    if (this.map) {
      this.map.zoomIn();
    }
  }

  zoomOut() {
    if (this.map) {
      this.map.zoomOut();
    }
  }

  protected addTrackLayer() {
    if (this.map) {
      this.map.addSource('track-log', {
        type: 'geojson',
        data: this.trackData as any,
      });
      this.map.addLayer({
        id: 'track-log',
        type: 'line',
        source: 'track-log',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#888',
          'line-width': 3
        }
      });
    }
  }

  protected addCurrentLocationMarker() {
    if (this.map) {
      this.map!.addSource('current-location', {
        type: 'geojson',
        data: this.currentLocationData as any,
      });
      this.map!.addLayer({
        id: 'current-location',
        type: 'symbol',
        source: 'current-location',
        layout: {
          'icon-image': 'arrow',
          "icon-size": 0.25,
          "icon-rotate": 90
        }
      });
    }
  }


  onTouchEvent(event: TouchEvent | MouseEvent | null = null) {
    if (!this.map || !event) {
      return;
    }
    const target = event.target as HTMLElement;
    if (!target) {
      return;
    }
    console.log(target)
    if (target.ariaLabel === 'Map') {
      console.log('Map moved by user');
      this.moved = true;
      this.mapRotated = true;
    }
  }

  setCenterToCurrentLocation() {
    if (this.locationService.curLatitude && this.locationService.curLongitude) {
      this.center = [
        this.locationService.curLongitude,
        this.locationService.curLatitude
      ];
    }
    this.moved = false;
    return true;
  }

  get trackData() {
    const coordinates = this.locationService.coordinatesLog.map((coords) => [
      coords.longitude,
      coords.latitude,
    ]);

    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: coordinates,
      },
    }
  }


  get currentLocationData() {
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [
          this.locationService.curLongitude,
          this.locationService.curLatitude,
        ],
      },
    };
  }

  // get layers() {
  //   return [
  //     polyline(
  //       this.locationService.coordinatesLog.map((coords) => {
  //         return [coords.latitude, coords.longitude];
  //       })
  //     ),
  //   ];
  // }
}
