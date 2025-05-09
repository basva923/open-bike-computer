import { Component } from '@angular/core';
import { LeafletMapComponent } from '../leaflet-map/leaflet-map.component';
import { SettingsComponent } from '../settings/settings.component';
import { MetricsComponent } from '../metrics/metrics.component';
import { MatTabsModule } from '@angular/material/tabs';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LeafletMapComponent, SettingsComponent, MetricsComponent, MatTabsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  activeTab = 1;
}
