import { Component } from '@angular/core';
import { LeafletMapComponent } from '../leaflet-map/leaflet-map.component';
import { SettingsComponent } from '../settings/settings.component';
import { MetricsComponent } from '../metrics/metrics.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MapboxMapComponent } from '../mapbox-map/mapbox-map.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LeafletMapComponent, SettingsComponent, MetricsComponent, MatTabsModule, MapboxMapComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  activeTab = 1;
}
