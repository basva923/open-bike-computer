import { IMetricService } from '../services/IMetricService';
import { UnitConversion } from '../util/unit-conversion';

export enum MetricType {
    ALTITUDE = "ALTITUDE",
    CADENCE = "CADENCE",
    DISTANCE = "DISTANCE",
    GRADE = "GRADE",
    HEART_RATE = "HEART_RATE",
    LATITUDE = "LATITUDE",
    LONGITUDE = "LONGITUDE",
    POWER_BALENCE = "POWER_BALENCE",
    POWER = "POWER",
    SPEED = "SPEED",
    TEMPERATURE = "TEMPERATURE",
    VERTICAL_SPEED = "VERTICAL_SPEED",
    WHEEL_ROTATIONS = "WHEEL_ROTATIONS"
}


export abstract class Metric {
    protected type: MetricType;
    protected name: string;
    protected siUnit: string;
    protected preferredUnit: string;
    protected preferredPrecision: number;

    protected values: number[];
    protected timestamps: Date[];

    protected metricService: IMetricService;

    constructor(type: MetricType, name: string, siUnit: string, metricService: IMetricService, preferredUnit: string = siUnit, preferredPrecision: number = 2) {
        this.type = type;
        this.metricService = metricService;
        this.name = name;
        this.siUnit = siUnit;
        this.preferredUnit = preferredUnit;
        this.preferredPrecision = preferredPrecision;
        this.values = [];
        this.timestamps = [];
    }

    /**
     * Start logging the metric. This method should be implemented by subclasses to start the logging process.
     */
    abstract startLogging(): void;

    /**
     * Stop logging the metric. This method should be implemented by subclasses to stop the logging process.
     */
    abstract stopLogging(): void;

    addValue(value: number, timestamp: Date) {
        this.values.push(value);
        this.timestamps.push(timestamp);
    }
    getValues(): number[] {
        return this.values;
    }
    getTimestamps(): Date[] {
        return this.timestamps;
    }
    getName(): string {
        return this.name;
    }
    getPreferredUnit(): string {
        return this.preferredUnit;
    }
    getLastValue(): number | null {
        if (this.values.length > 0) {
            return this.values[this.values.length - 1];
        }
        return null;
    }
    displayLastValue(includeUnit: boolean = true): string {
        const lastValue = this.getLastValue();
        if (lastValue !== null) {
            let valueConverted = lastValue;
            if (this.siUnit !== this.preferredUnit) {
                valueConverted = UnitConversion.convert(lastValue, this.siUnit, this.preferredUnit);
            }
            if (includeUnit) {
                return `${valueConverted.toFixed(this.preferredPrecision)} ${this.preferredUnit}`;
            }
            return `${valueConverted.toFixed(this.preferredPrecision)}`;
        }
        return 'No data';
    }

    getLastTimestamp(): Date | null {
        if (this.timestamps.length > 0) {
            return this.timestamps[this.timestamps.length - 1];
        }
        return null;
    }
}

