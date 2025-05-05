import { PowerMeterData } from "../model/PowerMeterData";
import { PowerMeterServiceEvent } from "../model/PowerMeterServiceEvent";

export interface IPowerMeterService {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    reconnectToLastConnected(): Promise<void>;
    selectNewDevice(): Promise<void>;
    subscribeForPowerData(callback: (event: PowerMeterServiceEvent) => void): void;
    unsubscribeForPowerData(callback: (event: PowerMeterServiceEvent) => void): void;
    readonly deviceSelected: boolean;
    readonly deviceName: string;
    readonly isConnected: boolean;
}