interface Place {
    name: string;
    latitude: number;
    longitude: number;
}

async function geocodeLocation(location: string, places: Place[]) {
    const result: {
        name: string;
        latitude: number;
        longitude: number;
    }[] = [];

    places.forEach(place => {
        if (place.name.toLowerCase().includes(location.toLowerCase())) {
            console.log('I am here');
            result.push(place);
        }
    });

    return result;
}

export {geocodeLocation};
