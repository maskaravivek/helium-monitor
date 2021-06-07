const EMRIT_RATIO = 0.2

const USE_PROD_ENDPOINT = true
const PROD_API_ENDPOINT = "https://helium-monitor.herokuapp.com"
const LOCAL_API_ENDPOINT = "http://127.0.0.1:5000"

let API_ENDPOINT = USE_PROD_ENDPOINT ? PROD_API_ENDPOINT : LOCAL_API_ENDPOINT


window.addEventListener('DOMContentLoaded', (event) => {
    migrateOldData()
    migrateOldDataV2()
    attachEventHandlers();
    showEarningsOrConfigs();
});

function showEarningsOrConfigs() {
    if (hasSavedHotspots()) {
        displayHotspotEarnings();
    } else {
        displayConfigs();
    }
}

function attachEventHandlers() {
    document.getElementById('save_btn').addEventListener("click", function () {
        let hotspot_name_input_val = document.getElementById('hotspot_name').value;
        let percent = document.getElementById("percentage").value;

        hotspot_name_input_val = hotspot_name_input_val.toLowerCase().trim().replaceAll(' ', '-')
        if (hotspot_name_input_val !== "" && hotspot_name_input_val !== null && hotspot_name_input_val !== undefined) {
            addOrEditConfig(hotspot_name_input_val, percent);
        }
    });

    document.getElementById('hotspot_name').addEventListener('input', (event) => {
        document.getElementById('add_hotspot_error').innerHTML = ""
    });


    document.getElementById('hotspot_list').addEventListener('click', (event) => {
        const isButton = event.target.nodeName === 'BUTTON';
        if (!isButton) {
            return;
        }

        removeHotspot(event.target.value);
    })

    document.getElementById('cancel_btn').addEventListener("click", function () {
        displayConfigs();
    });

    document.getElementById('home_btn').addEventListener("click", function () {
        displayHotspotEarnings();
    });

    document.getElementById('add_btn').addEventListener("click", function () {
        showAddHotspotDiv();
    });

    document.getElementById('hotspot_btn').addEventListener("click", function () {
        showHotspotEligibilityDiv();
    });

    document.getElementById('edit_configs').addEventListener("click", function () {
        displayConfigs();
    });

    document.getElementById('refresh_btn').addEventListener("click", function () {
        displayHotspotEarnings();
    });

    document.getElementById('device_select').addEventListener("change", (event) => {
        setActiveSelection(event.target.value)
        displayEarnings()
    });

    document.getElementById('currency_select').addEventListener("change", (event) => {
        setActiveCurrency(event.target.value)
    });

    document.getElementById('nearby_hotspots').addEventListener("change", (event) => {
        getHotspotsinRange(event.target.value)
    });
}

function setActiveSelection(val) {
    localStorage.setItem("active_selection", val)
    if (val === 'all-devices') {
        document.getElementById("web_btn").disabled = true;
    } else {
        document.getElementById("web_btn").disabled = false;
    }
}

function setActiveCurrency(val) {
    var currencySplit = val.split(",");
    localStorage.setItem("active_currency", currencySplit[0])
    localStorage.setItem("active_currency_symbol", currencySplit[1])
}

function populateSelectBox() {
    let hotspots = getHotspots()

    let hotspot_select = document.getElementById('device_select')
    let options = []
    options.push("<option value ='all-devices'>All devices</option>")

    Object.keys(hotspots).forEach((hotspot) => {
        options.push(`<option value="${hotspot}">${hotspot}</option>`)
    })

    hotspot_select.innerHTML = options.join('')
    let last_active_selection = localStorage.getItem("active_selection")
    hotspot_select.value = last_active_selection
}

function removeHotspot(hotspot_name) {
    let hotspots = getHotspots()

    hotspots.hasOwnProperty(hotspot_name)
    delete hotspots[hotspot_name]
    setHotspots(hotspots)

    displayConfigs()
}

function showAddHotspotDiv() {
    document.getElementById('add_new_hotspot_div').style.display = 'block';
    document.getElementById('hotspot_div').style.display = 'none';
    document.getElementById('check_hotspot_eligibility_div').style.display = 'none';
}

function showHotspotEligibilityDiv(){
    document.getElementById('check_hotspot_eligibility_div').style.display = 'block';
    document.getElementById('add_new_hotspot_div').style.display = 'none';
    document.getElementById('hotspot_div').style.display = 'none';
}

function hasSavedHotspots() {
    let hotspots = getHotspots()

    return Object.keys(hotspots).length > 0;
}

function addOrEditConfig(hotspot_name, percent) {
    fetch(`${API_ENDPOINT}/api/v1/device?hotspot_name=${hotspot_name}`)
        .then(response => response.json())
        .then(data => {
            if ("error" in data) {
                document.getElementById('add_hotspot_error').innerHTML = data['error']
                return
            }
            let hotspots = getHotspots()

            hotspots[hotspot_name] = percent;
            setHotspots(hotspots)
            setTimeout(displayConfigs(), 500)
        })
        .catch(err => {
            document.getElementById('add_hotspot_error').innerHTML = "Couldn't add hotspot. Please try again."
        });
}

function migrateOldDataV2() {
    let is_migrated = localStorage.getItem('is_migrated_v2') === "true" || false;
    if (!is_migrated) {
        let hotspots = localStorage.getItem('hotspots')

        if (hotspots !== null && hotspots !== undefined) {
            hotspots = JSON.parse(hotspots)
            for (let key in hotspots) {
                if (hotspots[key] === "true" || hotspots[key] === true) {
                    hotspots[key] = 20
                } else {
                    hotspots[key] = 100
                }
            }

            setHotspots(hotspots)
        } else {
            setHotspots({})
        }

        localStorage.setItem("active_selection", "all-devices")
        localStorage.setItem("is_migrated_v2", true)
    }
}

function migrateOldData() {
    let is_migrated = localStorage.getItem('is_migrated') === "true" || false;
    if (!is_migrated) {
        let hotspot = localStorage.getItem('hotspot_name')
        let is_emrit = localStorage.getItem('is_emrit')

        if (hotspot !== null && hotspot !== undefined) {
            let hotspot_dict = {}
            hotspot_dict[hotspot] = is_emrit

            localStorage.setItem("hotspots", JSON.stringify(hotspot_dict))
        } else {
            localStorage.setItem("hotspots", JSON.stringify({}))
        }

        localStorage.setItem("active_selection", "all-devices")
        localStorage.setItem("is_migrated", true)
    }
}

window.addEventListener('focus', (event) => {
    displayHotspotEarnings();
});

function displayConfigs() {
    showConfigsDiv();
    let hotspots = getHotspots()
    showhotspots(Object.keys(hotspots))
    fetchAppConfigsAndDisplay()
}

function fetchAppConfigsAndDisplay() {
    fetch(`${API_ENDPOINT}/api/v1/config`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(data => {
            populateCurrencies(data['currencies'])
            displayConfigItems(data['configs'])
        })
        .catch(err => {
            console.log(err)
            document.getElementById('coffee_btn').classList.add('is-hidden')
            document.getElementById('new_hotspot_link').classList.add('is-hidden')
        })
}

function populateCurrencies(data) {
    let currency_select = document.getElementById('currency_select')
    let options = []

    Object.keys(data).forEach((currency) => {
        options.push(`<option value="${data[currency]['id']},${data[currency]['currencySymbol']}">${data[currency]['currencyName']} (${data[currency]['currencySymbol']})</option>`)
    })

    currency_select.innerHTML = options.join('')
    currency_select.value = getActiveCurrency() + ',' + getActiveCurrencySymbol()
}

function displayConfigItems(data) {
    let is_bmc_visible = data['show_bmc']
    let referral_visible = data['show_referral']
    if (is_bmc_visible) {
        document.getElementById('coffee_btn').classList.remove('is-hidden')
    }
    if (referral_visible) {
        document.getElementById('new_hotspot_link').classList.remove('is-hidden')
    }
}

function getHotspots() {
    let hotspots = localStorage.getItem("hotspots_v2")

    if (hotspots == null || hotspots == undefined) {
        return {}
    }

    hotspots = JSON.parse(hotspots)
    return hotspots
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

function setHotspots(data) {
    localStorage.setItem("hotspots_v2", JSON.stringify(data))
}


function showLoadingIndicator(isVisible) {
    if (isVisible) {
        document.getElementById('refresh_btn').classList.add("is-loading")
        document.getElementById('refresh_btn').classList.add("is-info")
        document.getElementById('refresh_btn_icon').style.display = 'none'
    } else {
        document.getElementById('refresh_btn').classList.remove("is-loading")
        document.getElementById('refresh_btn').classList.remove("is-info")
        document.getElementById('refresh_btn_icon').style.display = 'block'
    }

}

function getActiveCurrency() {
    let active_currency = localStorage.getItem("active_currency")
    if (active_currency == null || active_currency == undefined) {
        localStorage.setItem("active_currency", "usd")
        localStorage.setItem("active_currency_symbol", "$")
        active_currency = "usd"
    }
    return active_currency
}

function getActiveCurrencySymbol() {
    let active_currency_symbol = localStorage.getItem("active_currency_symbol")
    if (active_currency_symbol == null || active_currency_symbol == undefined) {
        localStorage.setItem("active_currency", "usd")
        localStorage.setItem("active_currency_symbol", "$")
        active_currency_symbol = "$"
    }
    return active_currency_symbol
}

function displayHotspotEarnings() {
    displayEarnings()
    showEarningsDiv();
    showLoadingIndicator(true)
    fetchAndDisplayEarnings();
    populateSelectBox();
    setTimeout(function () { showLoadingIndicator(false); }, 300)
}

function showConfigsDiv() {
    document.getElementById('configs-div').style.display = "block";
    document.getElementById('earnings-div').style.display = "none";
    document.getElementById('hotspot_div').style.display = 'block';
    document.getElementById('add_new_hotspot_div').style.display = 'none';
    document.getElementById('check_hotspot_eligibility_div').style.display = 'none';
}

function showEarningsDiv() {
    document.getElementById('configs-div').style.display = "none";
    document.getElementById('earnings-div').style.display = "block";
    document.getElementById('hotspot_div').style.display = 'none';
    document.getElementById('add_new_hotspot_div').style.display = 'none';
    document.getElementById('check_hotspot_eligibility_div').style.display = 'none';
}

function showhotspots(hotspots) {
    let hotspot_div = document.getElementById('hotspot_list')
    let hotspot_elements = []

    for (var idx = 0; idx < hotspots.length; idx++) {
        hotspot_elements.push(`<span class='tag is-success'>${hotspots[idx]}<button value="${hotspots[idx]}" class='delete is-small'></button></span>`)
    }

    let hotspots_html = hotspot_elements.join('')
    hotspot_div.innerHTML = hotspots_html
}

function fetchAndDisplayEarnings() {
    let hotspots = getHotspots()

    if (Object.keys(hotspots).length === 0) {
        return
    }

    let request = {
        "hotspots": hotspots,
        "currency": getActiveCurrency()
    }

    fetch(`${API_ENDPOINT}/api/v1/earningsv2`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(request)
    })
        .then(response => response.json())
        .then(data => {
            localStorage.setItem('earnings_resp', JSON.stringify(data))
            displayEarnings();
        })
        .catch(err => {
            console.log(err)
        })
}

function displayEarnings() {
    let earnings_resp = localStorage.getItem('earnings_resp')
    if (earnings_resp === null || earnings_resp === undefined) {
        return
    }
    earnings_resp = JSON.parse(earnings_resp)
    let active_selection = localStorage.getItem('active_selection')
    let is_cumulative = active_selection === 'all-devices'
    let data = {}
    if (is_cumulative) {
        data = earnings_resp['cumulative']
    } else {
        let devices_data = earnings_resp['devices']

        devices_data.forEach((device_data) => {
            if (device_data['device_details']['name'] === active_selection) {
                localStorage.setItem('active_hotspot_id', device_data['device_details']['address'])
                data = device_data
            }
        })
    }
    const last_1_hour = parseFloat(data['latest_window']);
    const last_24_hours = parseFloat(data['last_day']);
    const last_7_days = parseFloat(data['7_days_window']);
    const last_30_days = parseFloat(data['summary_window']);
    const price = parseFloat(data['price'])
    const currency_symbol = getActiveCurrencySymbol()

    if (getStatus(data, is_cumulative) === "offline") {
        document.getElementById('status_icon').src = 'assets/offline.png';
    } else {
        document.getElementById('status_icon').src = 'assets/online.png';
    }

    if (last_1_hour > 0) {
        document.getElementById('last-1-hour-hnt').style.display = 'block';
        document.getElementById('last-1-hour-hnt').innerHTML = `+ ${last_1_hour.toFixed(2)} HNT`;
    } else {
        document.getElementById('last-1-hour-hnt').style.display = 'none';
    }

    document.getElementById('last-day-window-hnt').innerHTML = `${last_24_hours.toFixed(2)} HNT`;
    document.getElementById('last-day-window-usd').innerHTML = `${currency_symbol} ${(last_24_hours * price).toFixed(2)}`;

    document.getElementById('last-7-day-window-hnt').innerHTML = `${last_7_days.toFixed(2)} HNT`;
    document.getElementById('last-7-day-window-usd').innerHTML = `${currency_symbol} ${(last_7_days * price).toFixed(2)}`;

    document.getElementById('summary-window-hnt').innerHTML = `${last_30_days.toFixed(2)} HNT`;
    document.getElementById('summary-window-usd').innerHTML = `${currency_symbol} ${(last_30_days * price).toFixed(2)}`;
}

function getStatus(data, is_cumulative) {
    if (is_cumulative) {
        return data['status']
    } else {
        return data['device_details']['status']
    }
}

function distance(lat1, lon1, lat2, lon2) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515 * 1.609344;
		return dist;
	}
}