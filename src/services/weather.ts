import {fetchWeatherApi} from 'openmeteo';

// Interfaces

// Helpers

// Main methods
async function taco() {
    const params = {
        "latitude": 43.4254,
        "longitude": -80.5112,
        "hourly": "temperature_2m",
        "current": "temperature_2m",
    };
    const url = "https://api.open-meteo.com/v1/forecast";
    const responses = await fetchWeatherApi(url, params);

    // Process first location. Add a for-loop for multiple locations or weather models
    const response = responses[0];

    // Attributes for timezone and location
    const latitude = response.latitude();
    const longitude = response.longitude();
    const elevation = response.elevation();
    const utcOffsetSeconds = response.utcOffsetSeconds();

    console.log(
        `\nCoordinates: ${latitude}°N ${longitude}°E`,
        `\nElevation: ${elevation}m asl`,
        `\nTimezone difference to GMT+0: ${utcOffsetSeconds}s`,
    );

    const current = response.current()!;
    const hourly = response.hourly()!;

    // Note: The order of weather variables in the URL query and the indices below need to match!
    const weatherData = {
        current: {
            time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
            temperature_2m: current.variables(0)!.value(),
        },
        hourly: {
            time: [...Array((Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval())].map(
                (_, i) => new Date((Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) * 1000)
            ),
            temperature_2m: hourly.variables(0)!.valuesArray(),
        },
    };

    // 'weatherData' now contains a simple structure with arrays with datetime and weather data
    console.log(
        `\nCurrent time: ${weatherData.current.time}`,
        weatherData.current.temperature_2m,
    );
    console.log("\nHourly data", weatherData.hourly)
}

interface Coordinates {
    latitude: number;
    longitude: number;
}

async function simplestTaco(coordinates: Coordinates) {
    const params = {
        "latitude": coordinates.latitude,
        "longitude": coordinates.longitude
    };
    const url = "https://api.open-meteo.com/v1/forecast";
    await fetchWeatherApi(url, params);

    // Process first location. Add a for-loop for multiple locations or weather models
    // const response = responses[0];

    // Attributes for timezone and location
    // const latitude = response.latitude();
    // const longitude = response.longitude();
    // const elevation = response.elevation();
    // const utcOffsetSeconds = response.utcOffsetSeconds();

    // console.log(
    //     `\nCoordinates: ${latitude}°N ${longitude}°E`,
    //     `\nElevation: ${elevation}m asl`,
    //     `\nTimezone difference to GMT+0: ${utcOffsetSeconds}s`,
    // );
}

export {taco, simplestTaco};
