import axios from "axios";

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

function parseGeocodingResults(geocodeResponseResults: GeocodingResult[]): Place[] {
    return geocodeResponseResults
        .map(({name, latitude, longitude}) => ({name, latitude, longitude}))
        .filter((place): place is Place =>
            place.latitude != null && place.longitude != null
        );
}

async function geocodeLocations(placeName: string, places: Place[]) {
    return places.filter(place => place.name.toLowerCase().includes(placeName.toLowerCase()));
}

async function fetchPlaceData(placeName: string): Promise<Place[]> {
    const geocodeResponse = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
        params: {
            name: placeName
        }
    });

    return parseGeocodingResults(geocodeResponse.data.results);
}


export {geocodeLocations, fetchPlaceData};

