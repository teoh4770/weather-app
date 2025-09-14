/**
 * Geocoding Utilities
 *
 * This module provides helper functions to fetch and parse geocoding results.
 *
 * Geocoding is the process of converting a human-readable place name
 * (e.g., "Toronto" or "Eiffel Tower") into geographical coordinates
 * (latitude and longitude). These coordinates can then be used for mapping,
 * distance calculations, or location-based features.
 *
 * Functions:
 * - parseGeocodingResults: Normalizes raw API results into a list of valid Place objects.
 * - fetchPlacesGeocoding: Queries the Open-Meteo Geocoding API for a place name
 *   and returns matching coordinates.
 *
 * Types:
 * - Place: Represents a valid geocoded location with name, latitude, and longitude.
 */

import axios from "axios";

// Interfaces
export interface Place {
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
async function fetchPlacesGeocoding(placeName: string): Promise<Place[]> {
    const geocodeResponse = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
        params: {
            name: placeName
        }
    });

    return parseGeocodingResults(geocodeResponse.data.results);
}


export {fetchPlacesGeocoding, parseGeocodingResults};

