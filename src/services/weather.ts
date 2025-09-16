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

interface CurrentWeatherData {
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

interface HourlyWeatherData {
    date: string; // 2025-09-15
    time: string; // 12:00AM
    temperature: string; // 12°C
    weatherCode: number; // 8
}

interface DailyWeatherData {
    date: string;
    maxTemperature: string;
    minTemperature: string;
    weatherCode: number;
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

function transformCurrentWeather(currentWeatherDataRaw: WeatherDataRaw['current'], currentUnits: WeatherDataRaw['current_units']): CurrentWeatherData {
    return {
        temperature: Math.round(currentWeatherDataRaw.temperature_2m) + currentUnits.temperature_2m,
        feelsLike: Math.round(currentWeatherDataRaw.apparent_temperature) + currentUnits.apparent_temperature,
        humidity: Math.round(currentWeatherDataRaw.relative_humidity_2m) + currentUnits.relative_humidity_2m,
        windSpeed: currentWeatherDataRaw.wind_speed_10m.toFixed(1) + currentUnits.wind_speed_10m,
        precipitation: currentWeatherDataRaw.precipitation.toFixed(1) + currentUnits.precipitation,
        isDaytime: currentWeatherDataRaw.is_day === 1,
        lastUpdated: {
            date: currentWeatherDataRaw.time.split('T')[0],
            time: currentWeatherDataRaw.time.split('T')[1],
        }
    }
}

function transformHourlyWeather(hourlyDataRaw: WeatherDataRaw['hourly'], hourlyUnits: WeatherDataRaw['hourly_units']): HourlyWeatherData[] {
    const result: HourlyWeatherData[] = [];

    hourlyDataRaw.time.forEach((time, index) => {
        result.push({
            date: time.split('T')[0],
            time: time.split('T')[1],
            temperature: Math.round(hourlyDataRaw.temperature_2m[index]) + hourlyUnits.temperature_2m,
            weatherCode: hourlyDataRaw.weather_code[index]
        })
    })

    return result;
}

function transformDailyWeather(dailyDataRaw: WeatherDataRaw['daily'], dailyUnits: WeatherDataRaw['daily_units']): DailyWeatherData[] {
    const result: DailyWeatherData[] = [];

    dailyDataRaw.time.forEach((date, index) => {
        result.push({
            date: date,
            maxTemperature: Math.round(dailyDataRaw.temperature_2m_max[index]) + dailyUnits.temperature_2m_max,
            minTemperature: Math.round(dailyDataRaw.temperature_2m_min[index]) + dailyUnits.temperature_2m_min,
            weatherCode: dailyDataRaw.weather_code[index]
        })
    })

    return result;
}

export {fetchWeatherData, transformCurrentWeather, transformHourlyWeather, transformDailyWeather};
