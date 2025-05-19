import { Component } from '@angular/core';
import { LngLatLike, Map, NavigationControl } from 'maplibre-gl';
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
  private locationService: LocationService
  protected center: LngLatLike = [0, 0];
  protected zoom: [number] = [12];
  protected northUp = true;

  moved: boolean = false;
  isProgramaticMove = false;

  constructor() {
    this.locationService = ServiceFactory.getLocationService();
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
        this.updateTrack(locationEvent);
        this.updateCurrentLocation(locationEvent);
        this.updateCenter(locationEvent);
      });
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
    this.map?.setLayoutProperty('current-location', 'icon-rotate', locationEvent.location.coords.heading!);
  }

  updateCenter(locationEvent: LocationServiceEvent) {
    if (!this.moved) {
      this.isProgramaticMove = true;
      this.center = [
        locationEvent.location.coords.longitude,
        locationEvent.location.coords.latitude
      ];
      this.map?.setCenter(this.center);
    }
  }

  onMoveStart() {
    if (!this.isProgramaticMove) {
      this.setMoved();
    }
  }
  onMoveEnd() {
    this.isProgramaticMove = false;
  }

  toggleNorth() {
    this.northUp = !this.northUp;
    if (this.northUp) {
      this.map?.setBearing(0);
    } else {
      if (this.locationService.curHeading) {
        this.map?.setBearing(this.locationService.curHeading);
      }
    }
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
          'line-width': 4
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


  setMoved() {
    console.log('Map moved by user');
    this.moved = true;
  }

  setCenterToCurrentLocation() {
    if (this.locationService.curLatitude && this.locationService.curLongitude) {
      this.isProgramaticMove = true;
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
