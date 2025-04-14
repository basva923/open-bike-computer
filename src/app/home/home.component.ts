import { Component } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MapComponent } from '../map/map.component';
import { SettingsComponent } from '../settings/settings.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgbNavModule, MapComponent, SettingsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  activeTab = 1;
}
