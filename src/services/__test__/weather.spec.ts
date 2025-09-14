import {describe, expect, it, vi} from "vitest";
import {fetchWeatherApi} from "openmeteo";
import {simplestTaco} from "../weather.ts";

vi.mock('openmeteo', () => ({
    fetchWeatherApi: vi.fn().mockResolvedValue([])
}));

const mockedFetchWeatherApi = vi.mocked(fetchWeatherApi, {
    deep: true
});

describe('fetchWeatherInfo', () => {
    it('should call fetchWeatherApi from openmeteo with correct endpoint and required arguments', async () => {
        // Arrange
        const url = 'https://api.open-meteo.com/v1/forecast'
        const params = {
            "latitude": 43.4254,
            "longitude": -80.5112
        };

        // Act
        await simplestTaco(params);

        // Assert
        expect(mockedFetchWeatherApi).toHaveBeenCalledOnce()
        expect(mockedFetchWeatherApi).toHaveBeenCalledWith(url, params);
    });
})