import { Injectable } from '@angular/core';
import { SpeedSensorServiceEvent } from '../model/SpeedSensorServiceEvent';
import { SpeedSensorData } from '../model/SpeedSensorData';
import { SpeedSensorService } from './speed-sensor.service';

@Injectable({
    providedIn: 'root'
})
export class SpeedSensorMockService extends SpeedSensorService {
    protected lastSpeedSensorData: SpeedSensorData | null = null;

    constructor() {
        super();
    }

    override async connect() {
        setInterval(() => {
            const now = new Date();
            let speedSensorData = new SpeedSensorData(
                now,
                0,
                0,
                0,
                0
            );
            if (this.lastSpeedSensorData) {
                const speed = (Math.floor(Math.random() * 10) + 30) / 3.6; // in m/s
                const wheelCircumference = 2.1; // in meters
                const wheelRotations = speed / wheelCircumference;
                const crankRevolutions = Math.floor(((Math.random() * 5) + 90) / 60);

                speedSensorData = new SpeedSensorData(
                    now,
                    this.lastSpeedSensorData.cumulativeWheelRevolutions! + wheelRotations,
                    this.lastSpeedSensorData.cumulativeCrankRevolutions! + crankRevolutions,
                    this.lastSpeedSensorData.lastWheelEventTime! + 1024,
                    this.lastSpeedSensorData.lastCrankEventTime! + 1024
                )
            }

            this.lastSpeedSensorData = speedSensorData;
            this.speedSensorEvent.dispatchEvent(new SpeedSensorServiceEvent(speedSensorData));
        }, 1000)
    }

    override async disconnect() {
        throw new Error('Method not implemented.');
    }

    override async reconnectToLastConnected() {
        await this.connect();
    }

    override async selectNewDevice() {
        throw new Error('Method not implemented.');
    }

    override get deviceSelected() {
        return true;
    }

    override get deviceName() {
        return "Mock Speed Sensor";
    }

    override get isConnected() {
        return true;
    }
}
