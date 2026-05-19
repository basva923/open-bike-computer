import { Component } from '@angular/core';
import { SettingsComponent } from '../settings/settings.component';
import { MetricsComponent } from '../metrics/metrics.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MapLibreMapComponent } from '../maplibre-map/maplibre-map.component';
import { MatIconModule } from '@angular/material/icon';
import { WorkoutComponent } from '../workout/workout.component';
import { MatButtonModule } from '@angular/material/button';
import { LapsComponent } from '../laps/laps.component';
import { TrainingService } from '../services/training.service';
import { ServiceFactory } from '../services/ServiceFactory';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SettingsComponent, MetricsComponent, WorkoutComponent, MatTabsModule, MapLibreMapComponent, MatIconModule, MatButtonModule, LapsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  activeTab = 1;
  protected showFooter = false;
  private readonly expandedFooterHeight = '30vh';
  private trainingService: TrainingService;

  constructor() {
    this.trainingService = ServiceFactory.getTrainingService();
  }

  toggleFooter() {
    this.showFooter = !this.showFooter;
  }

  get toggleFooterIcon(): string {
    return this.showFooter ? 'keyboard_arrow_down' : 'keyboard_arrow_up';
  }

  get toggleFooterLabel(): string {
    return this.showFooter ? 'Close footer popup' : 'Open footer popup';
  }

  get contentHeight(): string {
    // full tabs height - 7vh
    return `calc(${this.fullTabsHeight} - 7vh)`;
  }

  get fullTabsHeight(): string {
    if (this.showFooter) {
      return `calc(100vh - ${this.footerHeight})`;
    } else {
      return '100vh';
    }
  }

  get footerHeight(): string {
    return this.showFooter ? this.expandedFooterHeight : '0vh';
  }

  get toggleBottomMargin(): string {
    return `calc(${this.footerHeight} + env(safe-area-inset-bottom) + 1rem)`;
  }

  get trainingActive(): boolean {
    return this.trainingService.currentStep !== null;
  }
}
