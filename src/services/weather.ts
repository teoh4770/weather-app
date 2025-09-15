import axios from "axios";

// Interfaces
interface Coordinates {
    latitude: number;
    longitude: number;
}

interface WeatherDataRaw {
    latitude: number;
    longitude: number;
    generationtime_ms: number;
    utc_offset_seconds: number;
    timezone: string;
    timezone_abbreviation: string;
    elevation: number;
    current_units: {
        time: string;
        interval: string;
        temperature_2m: string;
        relative_humidity_2m: string;
        wind_speed_10m: string;
        precipitation: string;
        apparent_temperature: string;
        is_day: string;
    },
    current: {
        time: string;
        interval: number;
        temperature_2m: number;
        relative_humidity_2m: number;
        wind_speed_10m: number;
        precipitation: number;
        apparent_temperature: number;
        is_day: number;
    },
    hourly_units: {
        time: string;
        temperature_2m: string;
        weather_code: string;
    },
    hourly: {
        time: string[];
        temperature_2m: number[];
        weather_code: number[];
    },
    daily_units: {
        time: string;
        temperature_2m_max: string;
        temperature_2m_min: string;
        weather_code: string;
    },
    daily: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        weather_code: number[];
    }
}

interface CurrentWeatherDataUI {
    temperature: string;
    feelsLike: string;
    humidity: string;
    windSpeed: string;
    precipitation: string;
    isDaytime: boolean;
    lastUpdated: {
        date: string,
        time: string
    }
}

// Helpers
async function fetchWeatherData(coordinates: Coordinates): Promise<WeatherDataRaw> {
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

function transformCurrentWeather(currentWeatherDataRaw: WeatherDataRaw['current'], currentUnits: WeatherDataRaw['current_units']): CurrentWeatherDataUI {
    const temperature = Math.round(currentWeatherDataRaw.temperature_2m);
    const feelsLike = Math.round(currentWeatherDataRaw.apparent_temperature);
    const humidity = Math.round(currentWeatherDataRaw.relative_humidity_2m);
    const windSpeed = currentWeatherDataRaw.wind_speed_10m.toFixed(1);
    const precipitation = currentWeatherDataRaw.precipitation.toFixed(1);
    const isDaytime = currentWeatherDataRaw.is_day === 1;
    const [date, time] = currentWeatherDataRaw.time.split('T');

    return {
        temperature: temperature + currentUnits.temperature_2m,
        feelsLike: feelsLike + currentUnits.apparent_temperature,
        humidity: humidity + currentUnits.relative_humidity_2m,
        windSpeed: windSpeed + currentUnits.wind_speed_10m,
        precipitation: precipitation + currentUnits.precipitation,
        isDaytime: isDaytime,
        lastUpdated: {
            date,
            time
        }
    }
}

export {fetchWeatherData, transformCurrentWeather};
