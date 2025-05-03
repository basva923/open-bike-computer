import { MetricService } from "../services/metric.service";

var convert = require('convert-units')


export abstract class Metric {
    protected name: string;
    protected siUnit: string;
    protected preferredUnit: string;
    protected preferredPrecision: number;

    protected values: number[];
    protected timestamps: Date[];

    protected metricService: MetricService;

    constructor(name: string, siUnit: string, metricService: MetricService, preferredUnit: string = siUnit, preferredPrecision: number = 2) {
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
    displayLastValue(): string {
        const lastValue = this.getLastValue();
        if (lastValue !== null) {
            let valueConverted = lastValue;
            if (this.siUnit !== this.preferredUnit) {
                valueConverted = convert(lastValue).from(this.siUnit).to(this.preferredUnit);
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

