import { Component } from '@angular/core';

import { LngLatLike, Map, NavigationControl } from 'mapbox-gl';
import { MapComponent, ControlComponent } from 'ngx-mapbox-gl';
import { LocationService } from '../services/location.service';
import { ServiceFactory } from '../services/ServiceFactory';
import { LocationServiceEvent } from '../model/LocationServiceEvent';
import { Util } from '../util/util';


@Component({
  selector: 'app-mapbox-map',
  standalone: true,
  imports: [MapComponent, ControlComponent],
  templateUrl: './mapbox-map.component.html',
  styleUrl: './mapbox-map.component.css'
})
export class MapboxMapComponent {
  map: Map | null = null;
  private locationService: LocationService
  protected center: LngLatLike = [0, 0];

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
      this.map.resize()
      this.addNavigationControl();
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

  protected addNavigationControl() {
    if (this.map) {
      const nav = new NavigationControl({
        visualizePitch: true,
        showCompass: true,
        showZoom: true
      });
      this.map.addControl(nav, 'top-right');
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
      this.map.loadImage("assets/icons/right-arrow.png", (error, image) => {
        if (error) throw error;
        this.map!.addImage('arrow', image!);
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
