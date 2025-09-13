import axios from "axios";

interface Place {
    name: string;
    latitude: number;
    longitude: number;
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

    return geocodeResponse.data.results.map(place => {
        return {
            name: place.name,
            latitude: place.latitude,
            longitude: place.longitude
        }
    });
}


export {geocodeLocations, fetchPlaceData};
