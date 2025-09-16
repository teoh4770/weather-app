import {afterEach, describe, expect, it, vi} from "vitest";
import {fetchWeatherData, transformCurrentWeather, transformDailyWeather, transformHourlyWeather} from "../weather.ts";
import axios from "axios";

// Successful payload in the format matching Open-Meteo documentation after transformation
const mockSuccessfulWeatherPayload = {
    data: {
        "latitude": 43.4254,
        "longitude": -80.5112,
        "generationtime_ms": 0.16951560974121094,
        "utc_offset_seconds": 0,
        "timezone": "GMT",
        "timezone_abbreviation": "GMT",
        "elevation": 38,
        "current_units": {
            "time": "iso8601",
            "interval": "seconds",
            "temperature_2m": "°C",
            "relative_humidity_2m": "%",
            "wind_speed_10m": "km/h",
            "precipitation": "mm",
            "apparent_temperature": "°C",
            "is_day": ""
        },
        "current": {
            "time": "2025-09-15T17:15",
            "interval": 900,
            "temperature_2m": 20.2,
            "relative_humidity_2m": 70,
            "wind_speed_10m": 9.2,
            "precipitation": 0,
            "apparent_temperature": 20.4,
            "is_day": 1
        },
        "hourly_units": {
            "time": "iso8601",
            "temperature_2m": "°C",
            "weather_code": "wmo code"
        },
        "hourly": {
            // Originally has 168 hours
            // 7 * 24 = 168 hours
            // Simplify to 3 for testing purposes only
            "time": [
                "2025-09-15T00:00",
                "2025-09-15T01:00",
                "2025-09-15T02:00"
            ],
            "temperature_2m": [
                12.2,
                12.1,
                12,
            ],
            "weather_code": [
                2,
                2,
                3,
            ]
        },
        "daily_units": {
            "time": "iso8601",
            "temperature_2m_max": "°C",
            "temperature_2m_min": "°C",
            "weather_code": "wmo code"
        },
        "daily": {
            "time": [
                "2025-09-15",
                "2025-09-16",
                "2025-09-17",
                "2025-09-18",
                "2025-09-19",
                "2025-09-20",
                "2025-09-21"
            ],
            "temperature_2m_max": [
                21.6,
                19,
                18.2,
                20.2,
                24.6,
                27.2,
                25.7
            ],
            "temperature_2m_min": [
                12,
                13.5,
                12.4,
                14.6,
                14.7,
                15.6,
                16.1
            ],
            "weather_code": [
                81,
                80,
                80,
                3,
                3,
                3,
                3
            ]
        }
    },
    status: 200,
}

vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
    }
}));

const mockedAxios = vi.mocked(axios, {
    deep: true
});

describe('fetchWeatherData', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should fetch weather successfully', async () => {
        // Arrange
        const coordinates = {
            "latitude": 43.4254,
            "longitude": -80.5112,
        };

        const url = 'https://api.open-meteo.com/v1/forecast'
        const params = {
            ...coordinates,
            "daily": ["temperature_2m_max", "temperature_2m_min", "weather_code"],
            "hourly": ["temperature_2m", "weather_code"],
            "current": ["temperature_2m", "relative_humidity_2m", "wind_speed_10m", "precipitation", "apparent_temperature", "is_day"],
        };

        mockedAxios.get.mockResolvedValueOnce(mockSuccessfulWeatherPayload);

        // Act
        const expected = await fetchWeatherData(coordinates);

        // Assert
        expect(axios.get).toHaveBeenCalledWith(url, {
            params
        })
        expect(expected).toEqual(mockSuccessfulWeatherPayload.data);
    });
})

describe('transformCurrentWeather', () => {
    it('should transform current weather', () => {
        // Arrange
        const currentWeatherData = mockSuccessfulWeatherPayload.data.current;
        const currentUnits = mockSuccessfulWeatherPayload.data.current_units;

        // Act
        const transformedCurrentWeatherData = transformCurrentWeather(currentWeatherData, currentUnits);

        // Assert
        expect(transformedCurrentWeatherData).toEqual({
            temperature: "20°C",
            feelsLike: "20°C",
            humidity: "70%",
            windSpeed: "9.2km/h",
            precipitation: "0.0mm",
            isDaytime: true,
            lastUpdated: {
                date: '2025-09-15',
                time: '17:15'
            }
        });
    });
})

describe('transformHourlyWeather', () => {
    it('should transform hourly weather', () => {
        // Arrange
        const hourlyWeatherData = mockSuccessfulWeatherPayload.data.hourly;
        const hourlyUnits = mockSuccessfulWeatherPayload.data.hourly_units;

        // Act
        const transformedHourlyWeatherData = transformHourlyWeather(hourlyWeatherData, hourlyUnits);

        // Assert
        expect(transformedHourlyWeatherData).toEqual([
            {date: '2025-09-15', time: '00:00', temperature: '12°C', weatherCode: 2},
            {date: '2025-09-15', time: '01:00', temperature: '12°C', weatherCode: 2},
            {date: '2025-09-15', time: '02:00', temperature: '12°C', weatherCode: 3},
        ])
    });
})

describe('transformDailyWeather', () => {
    it('should transform daily weather', () => {
        // Arrange
        const dailyWeatherData = mockSuccessfulWeatherPayload.data.daily;
        const dailyUnits = mockSuccessfulWeatherPayload.data.daily_units;

        // Act
        const transformedDailyWeatherData = transformDailyWeather(dailyWeatherData, dailyUnits);

        // Assert
        expect(transformedDailyWeatherData).toEqual([
            {
                date: '2025-09-15',
                maxTemperature: '22°C',
                minTemperature: '12°C',
                weatherCode: 81
            },
            {
                date: '2025-09-16',
                maxTemperature: '19°C',
                minTemperature: '14°C',
                weatherCode: 80
            },
            {
                date: '2025-09-17',
                maxTemperature: '18°C',
                minTemperature: '12°C',
                weatherCode: 80
            },
            {
                date: '2025-09-18',
                maxTemperature: '20°C',
                minTemperature: '15°C',
                weatherCode: 3
            },
            {
                date: '2025-09-19',
                maxTemperature: '25°C',
                minTemperature: '15°C',
                weatherCode: 3
            },
            {
                date: '2025-09-20',
                maxTemperature: '27°C',
                minTemperature: '16°C',
                weatherCode: 3
            },
            {
                date: '2025-09-21',
                maxTemperature: '26°C',
                minTemperature: '16°C',
                weatherCode: 3
            }
        ]);
    });
})