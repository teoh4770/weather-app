import axios from "axios";

// Interfaces
interface Place {
    name: string;
    latitude: number;
    longitude: number;
}

interface GeocodingResult {
    name: string;
    latitude?: number;
    longitude?: number;

    [key: string]: any;
}

// Helpers
function parseGeocodingResults(geocodeResponseResults: GeocodingResult[]): Place[] {
    return geocodeResponseResults
        .map(({name, latitude, longitude}) => ({name, latitude, longitude}))
        .filter((place): place is Place =>
            place.latitude != null && place.longitude != null
        );
}

// Main methods
async function fetchPlaceData(placeName: string): Promise<Place[]> {
    const geocodeResponse = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
        params: {
            name: placeName
        }
    });

    return parseGeocodingResults(geocodeResponse.data.results);
}


export {geocodeLocations, fetchPlaceData};

