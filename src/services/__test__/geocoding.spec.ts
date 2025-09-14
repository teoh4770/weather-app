import {beforeEach, describe, expect, it, vi} from "vitest";
import {fetchPlacesGeocoding, parseGeocodingResults, type Place} from "../geocoding.ts";
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

// Test HTTP connection
describe('fetchPlacesGeocoding', () => {
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
        const result = await fetchPlacesGeocoding(searchQuery);

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
        const result = await fetchPlacesGeocoding(searchQuery);

        // Assert
        expect(mockedAxios.get).toHaveBeenCalledOnce();
        expect(mockedAxios.get).toHaveBeenCalledWith(
            'https://geocoding-api.open-meteo.com/v1/search',
            {params: {name: searchQuery}}
        )

        expect(result).toEqual(expectedTransformedData);
    });
});

// Test transform and filter logic
describe('parseGeocodingResults', () => {
    it('should transform completely valid data correctly', () => {
        // Arrange
        const validResults = [
            {
                id: 123,
                name: "Berlin",
                latitude: 52.52437,
                longitude: 13.41053,
                country: "Germany"
            },
            {
                id: 456,
                name: "Paris",
                latitude: 48.85341,
                longitude: 2.3488,
                elevation: 35
            }
        ];

        const expectedOutput = [
            {
                name: "Berlin",
                latitude: 52.52437,
                longitude: 13.41053
            },
            {
                name: "Paris",
                latitude: 48.85341,
                longitude: 2.3488
            }
        ];

        // Act
        const result = parseGeocodingResults(validResults);

        // Assert
        expect(result).toEqual(expectedOutput);
    });

    it('should filter out entries missing latitude only', () => {
        // Arrange
        const mixedResults = [
            {
                name: "Berlin",
                latitude: 52.52437,
                longitude: 13.41053
            },
            {
                name: "London",
                // latitude is missing
                longitude: -0.1276
            }
        ];

        const expectedOutput = [
            {
                name: "Berlin",
                latitude: 52.52437,
                longitude: 13.41053
            }
        ];

        // Act
        const result = parseGeocodingResults(mixedResults);

        // Assert
        expect(result).toEqual(expectedOutput);
    });

    it('should filter out entries missing longitude only', () => {
        // Arrange
        const mixedResults = [
            {
                name: "Berlin",
                latitude: 52.52437,
                longitude: 13.41053
            },
            {
                name: "Tokyo",
                latitude: 35.6762
                // longitude is missing
            }
        ];

        const expectedOutput = [
            {
                name: "Berlin",
                latitude: 52.52437,
                longitude: 13.41053
            }
        ];

        // Act
        const result = parseGeocodingResults(mixedResults);

        // Assert
        expect(result).toEqual(expectedOutput);
    });

    it('should filter out entries missing both coordinates', () => {
        // Arrange
        const mixedResults = [
            {
                name: "Berlin",
                latitude: 52.52437,
                longitude: 13.41053
            },
            {
                name: "Unknown Place"
                // both latitude and longitude are missing
            }
        ];

        const expectedOutput = [
            {
                name: "Berlin",
                latitude: 52.52437,
                longitude: 13.41053
            }
        ];

        // Act
        const result = parseGeocodingResults(mixedResults);

        // Assert
        expect(result).toEqual(expectedOutput);
    });

    it('should handle negative coordinates correctly', () => {
        // Arrange
        const resultsWithNegativeCoords = [
            {
                name: "Sydney",
                latitude: -33.8688,
                longitude: 151.2093
            },
            {
                name: "Buenos Aires",
                latitude: -34.6037,
                longitude: -58.3816
            }
        ];

        const expectedOutput = [
            {
                name: "Sydney",
                latitude: -33.8688,
                longitude: 151.2093
            },
            {
                name: "Buenos Aires",
                latitude: -34.6037,
                longitude: -58.3816
            }
        ];

        // Act
        const result = parseGeocodingResults(resultsWithNegativeCoords);

        // Assert
        expect(result).toEqual(expectedOutput);
    });

    it('should handle zero coordinates correctly', () => {
        // Arrange
        const resultsWithZeroCoords = [
            {
                name: "Null Island", // A fictional place at 0,0
                latitude: 0,
                longitude: 0
            },
            {
                name: "Equator Point",
                latitude: 0,
                longitude: 15.5
            }
        ];

        const expectedOutput = [
            {
                name: "Null Island",
                latitude: 0,
                longitude: 0
            },
            {
                name: "Equator Point",
                latitude: 0,
                longitude: 15.5
            }
        ];

        // Act
        const result = parseGeocodingResults(resultsWithZeroCoords);

        // Assert
        expect(result).toEqual(expectedOutput);
    });

    it('should return empty array when input array is empty', () => {
        // Arrange
        const emptyResults: Place[] = [];

        // Act
        const result = parseGeocodingResults(emptyResults);

        // Assert
        expect(result).toEqual([]);
        expect(result).toHaveLength(0);
    });
});
