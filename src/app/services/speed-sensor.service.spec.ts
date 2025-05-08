import { TestBed } from '@angular/core/testing';
import { SpeedSensorService } from './speed-sensor.service';
import { SpeedSensorData } from '../model/SpeedSensorData';

describe('SpeedSensorService', () => {
    let service: SpeedSensorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SpeedSensorService);
    });

    it('should parse CSC data correctly', () => {
        const hexData = '030C000000441A0200991D';
        const buffer = new Uint8Array(hexData.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))).buffer;
        const dataView = new DataView(buffer);
        const timeStamp = Date.now();

        const result: SpeedSensorData = service['parseCSCData'](dataView, timeStamp);

        expect(result.cumulativeWheelRevolutions).toBe(12); // 0x0C
        expect(result.lastWheelEventTime).toBeInstanceOf(Date);
        expect(result.cumulativeCrankRevolutions).toBe(676); // 0x02A4
        expect(result.lastCrankEventTime).toBeInstanceOf(Date);
    });
});
