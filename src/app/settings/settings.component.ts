import { Component } from '@angular/core';
import { BluetoothService } from '../services/bluetooth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {

  bluetoothEnabled: boolean = false;

  constructor(private bluetoothService: BluetoothService) { }

  async ngOnLoad() {
    this.bluetoothEnabled = await this.bluetoothService.isBluetoothEnabled()
  }

  async requestBluetoothDevices() {
    await this.bluetoothService.requestBluetoothDevices();
  }
}
