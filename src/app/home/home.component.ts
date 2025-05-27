import { Component } from '@angular/core';
import { SettingsComponent } from '../settings/settings.component';
import { MetricsComponent } from '../metrics/metrics.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MapLibreMapComponent } from '../maplibre-map/maplibre-map.component';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SettingsComponent, MetricsComponent, MatTabsModule, MapLibreMapComponent, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  activeTab = 1;
  protected showFooter = false;


  get contentHeight(): string {
    return this.showFooter ? '83vh' : '93vh';
  }
}
