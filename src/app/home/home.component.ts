import { Component } from '@angular/core';
import { SettingsComponent } from '../settings/settings.component';
import { MetricsComponent } from '../metrics/metrics.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MapLibreMapComponent } from '../maplibre-map/maplibre-map.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SettingsComponent, MetricsComponent, MatTabsModule, MapLibreMapComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  activeTab = 1;
}
