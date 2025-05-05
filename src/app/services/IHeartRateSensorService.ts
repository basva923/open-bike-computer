import { HeartRateSensorServiceEvent } from "../model/HeartRateSensorServiceEvent";

export interface IHeartRateSensorService {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    reconnectToLastConnected(): Promise<void>;
    selectNewDevice(): Promise<void>;
    substribeForHeartRate(callback: (event: HeartRateSensorServiceEvent) => void): void;
    unsubscribeForHeartRate(callback: (event: HeartRateSensorServiceEvent) => void): void;
    readonly deviceSelected: boolean;
    readonly deviceName: string;
    readonly isConnected: boolean;
}