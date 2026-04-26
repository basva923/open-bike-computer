import { PowerMeterServiceEvent } from "../model/PowerMeterServiceEvent";
import { SpeedSensorServiceEvent } from "../model/SpeedSensorServiceEvent";

export interface ISpeedSensorService {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    reconnectToLastConnected(): Promise<void>;
    selectNewDevice(): Promise<void>;
    subscribeForSpeedData(callback: (event: SpeedSensorServiceEvent) => void): void;
    unsubscribeForSpeedData(callback: (event: SpeedSensorServiceEvent) => void): void;
    readonly deviceSelected: boolean;
    readonly deviceName: string;
    readonly isConnected: boolean;
}