import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';

import { provideAnimations } from '@angular/platform-browser/animations';
import { provideMapboxGL } from 'ngx-mapbox-gl';


export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideServiceWorker('ngsw-worker.js', {
    enabled: !isDevMode(),
    registrationStrategy: 'registerWhenStable:30000'
  }), provideAnimations(), provideMapboxGL({
    accessToken: "pk.eyJ1IjoiYmFzdmE5MjIiLCJhIjoiY2tjNjNqcHM4MG5uMjMwbnY5Nnp5eTJ2byJ9.tzWaG9p4ftWyFHzX_Ve6gw"
  })]
};
