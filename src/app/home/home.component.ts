import { Component } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { SettingsComponent } from '../settings/settings.component';
import { MetricsComponent } from '../metrics/metrics.component';
import { MatTabsModule } from '@angular/material/tabs';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MapComponent, SettingsComponent, MetricsComponent, MatTabsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  activeTab = 1;
}
