import {describe, expect, it, vi} from "vitest";
import {fetchPlaceData, geocodeLocations} from "../geocoding.ts";
import axios from "axios";

// Mock the entire axios module
vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
    }
}));

const mockedAxios = vi.mocked(axios, {
    deep: true
});

describe('fetchPlaceData', () => {
    it('should fetch and transform place data successfully', async () => {
        // Arrange
        const searchQuery = 'Berlin';
        const mockApiResponse = {
            data: {
                results: [
                    {
                        id: 2950159,
                        name: "Berlin",
                        latitude: 52.52437,
                        longitude: 13.41053,
                        elevation: 74,
                        feature_code: "PPLC",
                        country_code: "DE",
                        country: "Germany"
                    }
                ]
            },
            status: 200
        }

        const expectedTransformedData = [
            {
                name: 'Berlin',
                latitude: 52.52437,
                longitude: 13.41053,
            }
        ]

        mockedAxios.get.mockResolvedValueOnce(mockApiResponse)

        // Act
        const result = await fetchPlaceData(searchQuery);

        // Assert
        expect(mockedAxios.get).toHaveBeenCalledOnce();
        expect(mockedAxios.get).toHaveBeenCalledWith(
            'https://geocoding-api.open-meteo.com/v1/search',
            {params: {name: searchQuery}}
        )

        expect(result).toEqual(expectedTransformedData);
    });
})

describe('Geocoding service', () => {
    it('should return an empty array when given a place that does not exist', async () => {
        const fakeCityName = 'fake-city-name';

        const result = await geocodeLocations(fakeCityName, []);

        expect(result).toEqual([]);
        expect(result).toHaveLength(0);
    });

    it('should return a geocoding object when given a place that does exist', async () => {
        const location = 'Kitchener';

        const result = await geocodeLocations(location, [
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

        const result = await geocodeLocations(location, [
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

