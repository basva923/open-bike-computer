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
    WHEEL_ROTATIONS = "WHEEL_ROTATIONS",
    BEARING = "BEARING"
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

    constructor(type: MetricType, name: string, siUnit: string, metricService: IMetricService, preferredUnit: string = siUnit, preferredPrecision: number = 0) {
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

    get3sAverage(): number | null {
        const values = this.getValuesUnil(3);
        if (values.length === 0) {
            return null;
        }
        const sum = values.reduce((acc, value) => acc + value, 0);
        return sum / values.length;
    }

    get30sAverage(): number | null {
        const values = this.getValuesUnil(30);
        if (values.length === 0) {
            return null;
        }
        const sum = values.reduce((acc, value) => acc + value, 0);
        return sum / values.length;
    }

    getAverage(): number | null {
        if (this.values.length === 0) {
            return null;
        }
        const sum = this.values.reduce((acc, value) => acc + value, 0);
        return sum / this.values.length;
    }

    getMax(): number | null {
        if (this.values.length === 0) {
            return null;
        }
        return Math.max(...this.values);
    }


    displayLastValue(includeUnit: boolean = true): string {
        const lastValue = this.getLastValue();
        return this.displayValue(lastValue, includeUnit);
    }

    display3sAverage(includeUnit: boolean = true): string {
        const average = this.get3sAverage();
        return this.displayValue(average, includeUnit);
    }

    display30sAverage(includeUnit: boolean = true): string {
        const average = this.get30sAverage();
        return this.displayValue(average, includeUnit);
    }

    displayAverage(includeUnit: boolean = true): string {
        const average = this.getAverage();
        return this.displayValue(average, includeUnit);
    }

    displayMax(includeUnit: boolean = true): string {
        const max = this.getMax();
        return this.displayValue(max, includeUnit);
    }

    getLastTimestamp(): Date | null {
        if (this.timestamps.length > 0) {
            return this.timestamps[this.timestamps.length - 1];
        }
        return null;
    }
    getType(): MetricType {
        return this.type;
    }

    getValuesUnil(secondsAgo: number): number[] {
        const now = new Date();
        const threshold = new Date(now.getTime() - secondsAgo * 1000);
        return this.values.filter((_, index) => this.timestamps[index] >= threshold);
    }

    private displayValue(value: number | null, includeUnit: boolean = true): string {
        if (value === null) {
            return '---';
        }
        let valueConverted = value;
        if (this.siUnit !== this.preferredUnit) {
            valueConverted = UnitConversion.convert(value, this.siUnit, this.preferredUnit);
        }
        if (includeUnit) {
            return `${valueConverted.toFixed(this.preferredPrecision)} ${this.preferredUnit}`;
        }
        return `${valueConverted.toFixed(this.preferredPrecision)}`;
    }
}

