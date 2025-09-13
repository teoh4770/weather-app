import {beforeEach, describe, expect, it, vi} from "vitest";
import {fetchPlaceData} from "../geocoding.ts";
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
    beforeEach(() => {
        vi.clearAllMocks();
    })

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

    it('should filter out places with missing coordinates', async () => {
        // Arrange
        const searchQuery = 'Test-data';
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
                    },
                    {
                        id: 2643743,
                        name: "London",
                        latitude: 51.50853,
                        // longitude is missing!
                        elevation: 25,
                        feature_code: "PPLC",
                        country_code: "GB",
                        country: "United Kingdom"
                    },
                    {
                        id: 2988507,
                        name: "Paris",
                        latitude: 48.85341,
                        longitude: 2.3488,
                        elevation: 42,
                        feature_code: "PPLC",
                        country_code: "FR",
                        country: "France"
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
            },
            {
                name: 'Paris',
                latitude: 48.85341,
                longitude: 2.3488,
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
});

