window.addEventListener('DOMContentLoaded', (event) => {
    attachEventHandlers();
});

function attachEventHandlers() {
    document.getElementById('nearby_hotspots').addEventListener("change", (event) => {
        getHotspotsinRange(event.target.value)
    });

    if (!isElectronApp()) {
        webSpecificEvents()
    }
}

function isElectronApp() {
    return navigator.userAgent.includes("Electron")
}

function webSpecificEvents() {
    document.getElementById('coffee_btn').addEventListener("click", function () {
        window.open("https://www.buymeacoffee.com/maskara", '_blank');
    });

    document.getElementById('new_hotspot_link').addEventListener("click", function () {
        window.open("https://www.nebra.com/?ref=i0nmbh_csmsh", '_blank');
    });

    document.getElementById('emrit_hotspot_link').addEventListener("click", function () {
        window.open("https://docs.google.com/forms/d/e/1FAIpQLScynuDQP9TR1a9_hpg89IkwIV_wrXA78NSSbRsz3w5HZ8uNYg/viewform", '_blank');
    });
}

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
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
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
            var element = document.getElementById('nearby_hotspots')
            element.value = JSON.stringify(myJson);
            var locations = {}
            for (const [key, value] of Object.entries(myJson['data']))
            {   
                var loc_key = value.lat.toString() + ' - ' + value.lng.toString()
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

function getHotspotsinRange(val) {
    var json = JSON.parse(val)
    json = json['data']
    var tot_hotspots = json.length;

    var obj = json[0];

    if (tot_hotspots == 0) {
        var dist = 1000
    }
    else {
        var lat1 = document.getElementById('latitude').value;
        var lng1 = document.getElementById('longitude').value;
        var lat2 = obj.lat;
        var lng2 = obj.lng;

        var dist = distance(lat1, lng1, lat2, lng2) * 1000
    }

    var nhs = "Number of hotspots nearby: " + String(tot_hotspots) + '<br />';
    if (dist < 300) {
        document.getElementById('emrit_hotspot_link').classList.add("is-hidden")
        document.getElementById('nearby_hotspot_status').innerHTML = nhs + "You are not eligible for a hotspot! :(";
    }
    else {
        document.getElementById('emrit_hotspot_link').classList.remove("is-hidden")
        document.getElementById('nearby_hotspot_status').innerHTML = nhs + "You are eligible for a free hotspot! Sign up below to get yours now. :D";
    }
}

function distance(lat1, lon1, lat2, lon2) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515 * 1.609344;
        return dist;
    }
}