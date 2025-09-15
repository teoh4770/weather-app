import axios from "axios";

// Interfaces
interface Coordinates {
    latitude: number;
    longitude: number;
}

// Helpers

// Main methods
async function fetchWeatherData(coordinates: Coordinates) {
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
            "latitude": coordinates.latitude,
            "longitude": coordinates.longitude,
            "daily": ["temperature_2m_max", "temperature_2m_min", "weather_code"],
            "hourly": ["temperature_2m", "weather_code"],
            "current": ["temperature_2m", "relative_humidity_2m", "wind_speed_10m", "precipitation", "apparent_temperature", "is_day"],
        }
    })


    return response.data;
}

// Todo: transformWeatherData() converts the extracted values into UI-friendly objects

export {fetchWeatherData};
