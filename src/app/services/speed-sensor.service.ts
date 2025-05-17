import { Injectable } from '@angular/core';
import { SpeedSensorServiceEvent } from '../model/SpeedSensorServiceEvent';
import { SpeedSensorData } from '../model/SpeedSensorData';
import { ISpeedSensorService } from './ISpeedSensorService';

@Injectable({
    providedIn: 'root'
})
export class SpeedSensorService implements ISpeedSensorService {
    private device: BluetoothDevice | null = null;
    private server: BluetoothRemoteGATTServer | null = null;
    private service: BluetoothRemoteGATTService | null = null;
    private characteristic: BluetoothRemoteGATTCharacteristic | null = null;

    protected speedSensorEvent = new EventTarget();

    constructor() { }

    async connect() {
        if (!this.device) {
            console.error('No device selected');
            return;
        }
        this.server = await this.device.gatt!.connect();
        console.log('Connected to GATT Server:', this.server);

        this.service = await this.server.getPrimaryService('cycling_speed_and_cadence');
        this.characteristic = await this.service.getCharacteristic('csc_measurement');
        await this.characteristic.startNotifications();
        console.log('Notifications started for characteristic:', this.characteristic);
        this.storeLastConnectedDevice();

        this.characteristic.addEventListener('characteristicvaluechanged', (event: Event) => {
            const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
            if (value) {
                const speedData = this.parseCSCData(value, event.timeStamp);
                this.speedSensorEvent.dispatchEvent(new SpeedSensorServiceEvent(speedData));
            }
        });
    }

    async disconnect() {
        if (this.server) {
            await this.server.disconnect();
            this.server = null;
            this.service = null;
            this.characteristic = null;
        }
    }

    async selectNewDevice() {
        this.disconnect();
        this.device = await navigator.bluetooth.requestDevice({
            filters: [{ services: ['cycling_speed_and_cadence'] }]
        });
        console.log('Selected:', this.device.name);

        this.connect();
    }


    async reconnectToLastConnected() {
        if (this.isConnected) {
            return;
        }
        const devices = await navigator.bluetooth.getDevices();
        console.log('Devices:', devices);
        for (const device of devices) {
            if (device.id === this.getLastConnectedDevice()) {
                this.device = device;
                console.log('Selected:', this.device.name);
                await this.connect();
                return;
            }
        }
    }

    get deviceSelected() {
        return this.device !== null;
    }

    get deviceName(): string {
        return this.device?.name ?? 'No device selected';
    }

    get isConnected() {
        return this.device?.gatt?.connected || false;
    }

    subscribeForSpeedData(callback: (event: SpeedSensorServiceEvent) => void) {
        this.speedSensorEvent.addEventListener('speedSensorServiceEvent', callback as any);
    }

    unsubscribeForSpeedData(callback: (event: SpeedSensorServiceEvent) => void) {
        this.speedSensorEvent.removeEventListener('speedSensorServiceEvent', callback as any);
    }

    protected parseCSCData(value: DataView, timeStamp: number): SpeedSensorData {
        const flags = value.getUint8(0);
        let index = 1;

        const data = new SpeedSensorData(new Date(timeStamp));

        if (flags & 0x01) { // Wheel Revolution Data Present
            data.cumulativeWheelRevolutions = value.getUint32(index, true);
            index += 4;
            data.lastWheelEventTime = value.getUint16(index, true) // Unit is 1/1024 second
            index += 2;
        }

        if (flags & 0x02) { // Crank Revolution Data Present
            data.cumulativeCrankRevolutions = value.getUint16(index, true);
            index += 2;
            data.lastCrankEventTime = value.getUint16(index, true) // Unit is 1/1024 second
            index += 2;
        }

        return data;
    }

    private storeLastConnectedDevice() {
        if (this.device) {
            localStorage.setItem('lastConnectedSpeedSensorDevice', this.device.id);
        }
    }

    private getLastConnectedDevice() {
        return localStorage.getItem('lastConnectedSpeedSensorDevice');
    }
}
