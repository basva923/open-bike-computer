import convert, { Unit } from "convert";


export class UnitConversion {
    static convert(value: number, fromUnit: string, toUnit: string): number {
        if (fromUnit === toUnit) {
            return value; // No conversion needed
        }

        if (fromUnit === 'm/s') {
            if (toUnit === 'km/h') {
                return value * 3.6; // m/s to km/h
            }
        }

        return convert(value, fromUnit as Unit).to(toUnit as any) as any;
    }
}