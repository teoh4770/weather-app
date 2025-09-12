import {describe, expect, it} from "vitest";
import {geocodeLocation} from "../geocoding.ts";

describe('Geocoding service', () => {
    it('should return an empty array when given a place that does not exist', async () => {
        const fakeCityName = 'fake-city-name';

        const result = await geocodeLocation(fakeCityName, []);

        expect(result).toEqual([]);
        expect(result).toHaveLength(0);
    });

    it('should return a geocoding object when given a place that does exist', async () => {
        const location = 'Kitchener';

        const result = await geocodeLocation(location, [
            {
                name: 'Kitchener',
                latitude: 100,
                longitude: 100,
            },
            {
                name: 'Toronto',
                latitude: 150,
                longitude: 150,
            }
        ]);

        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('longitude');
        expect(typeof result[0].longitude).toBe('number');
        expect(result[0]).toHaveProperty('latitude');
        expect(typeof result[0].latitude).toBe('number');
    });

    it('should return a list of geocoding objects when given a place that does exist and several places have similar names', async () => {
        const location = 'San';

        const result = await geocodeLocation(location, [
            {
                name: 'San Diego',
                latitude: 100,
                longitude: 100,
            },
            {
                name: 'San Francisco',
                latitude: 150,
                longitude: 150,
            },
            {
                name: 'San Antonio',
                latitude: 250,
                longitude: 250,
            },
        ]);

        expect(result).toHaveLength(3);
        expect(result[0]).toHaveProperty('longitude');
        expect(typeof result[0].longitude).toBe('number');
        expect(result[0]).toHaveProperty('latitude');
        expect(typeof result[0].latitude).toBe('number');
        expect(result).toEqual([
            {
                name: 'San Diego',
                latitude: 100,
                longitude: 100,
            },
            {
                name: 'San Francisco',
                latitude: 150,
                longitude: 150,
            },
            {
                name: 'San Antonio',
                latitude: 250,
                longitude: 250,
            },
        ])
    });
})