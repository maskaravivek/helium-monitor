function initMap(latitude, longitude) {
    var geocoder = new google.maps.Geocoder();

    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: latitude, lng: longitude },
        zoom: 13,
        mapTypeId: "roadmap",
    });

    // Create the search box and link it to the UI element.
    const input = document.getElementById("pac-input");
    const searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    // Bias the SearchBox results towards current map's viewport.
    map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds());
    });

    let markers = [];

    markers.push(
        new google.maps.Marker({
        map,
        position: new google.maps.LatLng(latitude, longitude),
        animation: google.maps.Animation.DROP,
        })
    );

    fetchURL(latitude, longitude, 'init', geocoder, markers, map);

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();

        if (places.length == 0) {
        return;
        }
        // Clear out the old markers.
        markers.forEach((marker) => {
            marker.setMap(null);
        });
        
        markers = [];
        // For each place, get the icon, name and location.
        const bounds = new google.maps.LatLngBounds();
        number_places = places.length
        places.forEach((place) => {
        if (!place.geometry || !place.geometry.location) {
            console.log("Returned place contains no geometry");
            return;
        }
        if (number_places == 1) {
            latitude = place.geometry.location.lat();
            longitude = place.geometry.location.lng();
            document.getElementById('latitude').value = latitude;
            document.getElementById('longitude').value = longitude;

            fetchURL(latitude, longitude, 'placechange', geocoder, markers, map);
        }

        // Create a marker for each place.
        markers.push(
            new google.maps.Marker({
            map,
            position: place.geometry.location,
            animation: google.maps.Animation.DROP,
            })
        );

        if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
        } else {
            bounds.extend(place.geometry.location);
        }
        });

        map.fitBounds(bounds);
    });

    google.maps.event.addListener(map, 'click', (event) => {
        var location = event.latLng;

        if (!location){
            console.log("Returned place contains no geometry");
            return;
        }

        markers.forEach((marker) => {
            marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        const bounds = new google.maps.LatLngBounds();

        latitude = location.lat();
        longitude = location.lng();
        document.getElementById('latitude').value = latitude;
        document.getElementById('longitude').value = longitude;

        // Create a marker for each place.
        markers.push(
            new google.maps.Marker({
            map,
            position: location,
            animation: google.maps.Animation.DROP,
            })
        );
        
        fetchURL(latitude, longitude, 'click', geocoder, markers, map);

    });
}

function fetchURL(latitude, longitude, type, geocoder, markers, map) {

    if (type != 'placechange'){
        geocoder.geocode({
            'latLng': new google.maps.LatLng(latitude, longitude)
        }, function (results, status) {
            if (status ==
                google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    document.getElementById('pac-input').value = results[1].formatted_address;
                } else {
                    console.log('No results found');
                }
            } else {
                console.log('Geocoder failed due to: ' + status);
            }
        });
    }

    var url = "https://api.helium.io/v1/hotspots/location/distance?lat=" + latitude + "&lon=" + longitude + "&distance=1000";

    fetch(url)
        .then((response) => {
            return response.json();
        })
        .then((myJson) => {
            element = document.getElementById('nearby_hotspots')
            element.value = JSON.stringify(myJson);
            locations = {}
            for (const [key, value] of Object.entries(myJson['data']))
            {   
                loc_key = value.lat.toString() + ' - ' + value.lng.toString()
                if (loc_key in locations) {
                    locations[loc_key]['count'] = locations[loc_key]['count'] + 1
                }
                else{
                    locations[loc_key] = {'lat':value.lat, 'lng':value.lng, 'count':1}
                }
            }
            for (const [key, value] of Object.entries(locations)) {
                if (value['count'] == 1){
                    markers.push(
                        new google.maps.Marker({
                        map,
                        position: new google.maps.LatLng(value['lat'], value['lng']),
                        icon: './assets/signal-tower.png',
                        title: value['count'].toString() + ' hotspot',
                        animation: google.maps.Animation.BOUNCE,
                        })
                    );
                }
                else{
                    markers.push(
                        new google.maps.Marker({
                        map,
                        position: new google.maps.LatLng(value['lat'], value['lng']),
                        icon: './assets/signal-tower.png',
                        title: value['count'].toString() + ' hotspots',
                        animation: google.maps.Animation.BOUNCE,
                        })
                    );
                }
            }
            
            var event = new Event('change');
            element.dispatchEvent(event);
        });
}