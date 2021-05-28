const EMRIT_RATIO = 0.2

const USE_PROD_ENDPOINT = false
const PROD_API_ENDPOINT = "https://helium-monitor.herokuapp.com"
const LOCAL_API_ENDPOINT = "http://127.0.0.1:5000"

let API_ENDPOINT = USE_PROD_ENDPOINT ? PROD_API_ENDPOINT : LOCAL_API_ENDPOINT


window.addEventListener('DOMContentLoaded', (event) => {
    migrateOldData()
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
        let is_emrit = document.getElementById("is_emrit").checked;

        hotspot_name_input_val = hotspot_name_input_val.toLowerCase().trim().replaceAll(' ', '-')
        if (hotspot_name_input_val !== "" && hotspot_name_input_val !== null && hotspot_name_input_val !== undefined) {
            addOrEditConfig(hotspot_name_input_val, is_emrit);
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
}

function setActiveSelection(val) {
    localStorage.setItem("active_selection", val)
    if (val === 'all-devices') {
        document.getElementById("web_btn").disabled = true;
    } else {
        document.getElementById("web_btn").disabled = false;
    }
}

function populateSelectBox() {
    let hotspots = localStorage.getItem("hotspots")

    if (hotspots == null || hotspots == undefined) {
        return false;
    }

    hotspots = JSON.parse(hotspots)

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
    let hotspots = localStorage.getItem("hotspots")

    if (hotspots == null || hotspots == undefined) {
        return false;
    }

    hotspots = JSON.parse(hotspots)

    hotspots.hasOwnProperty(hotspot_name)
    delete hotspots[hotspot_name]
    localStorage.setItem("hotspots", JSON.stringify(hotspots))

    displayConfigs()
}

function showAddHotspotDiv() {
    document.getElementById('add_new_hotspot_div').style.display = 'block';
    document.getElementById('hotspot_list').style.display = 'none';
}

function hasSavedHotspots() {
    let hotspots = localStorage.getItem("hotspots")

    if (hotspots == null || hotspots == undefined) {
        return false;
    }

    hotspots = JSON.parse(hotspots)

    return Object.keys(hotspots).length > 0;
}

function addOrEditConfig(hotspot_name, is_emrit) {
    fetch(`${API_ENDPOINT}/api/v1/device?hotspot_name=${hotspot_name}`)
        .then(response => response.json())
        .then(data => {
            if ("error" in data) {
                document.getElementById('add_hotspot_error').innerHTML = data['error']
                return
            }
            let hotspots = localStorage.getItem("hotspots")

            if (hotspots !== null && hotspots !== undefined) {
                hotspots = JSON.parse(hotspots)
            }

            hotspots[hotspot_name] = is_emrit;
            localStorage.setItem("hotspots", JSON.stringify(hotspots))
            setTimeout(displayConfigs(), 500)
        })
        .catch(err => {
            document.getElementById('add_hotspot_error').innerHTML = "Couldn't add hotspot. Please try again."
        });
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
    let hotspots = localStorage.getItem("hotspots")

    if (hotspots == null || hotspots == undefined) {
        return
    }

    hotspots = JSON.parse(hotspots)
    showhotspots(Object.keys(hotspots))
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

function displayHotspotEarnings() {
    showEarningsDiv();
    showLoadingIndicator(true)
    fetchAndDisplayEarnings();
    populateSelectBox();
    setTimeout(function () { showLoadingIndicator(false); }, 300)
}

function showConfigsDiv() {
    document.getElementById('configs-div').style.display = "block";
    document.getElementById('earnings-div').style.display = "none";
    document.getElementById('hotspot_list').style.display = 'block';
    document.getElementById('add_new_hotspot_div').style.display = 'none';
}

function showEarningsDiv() {
    document.getElementById('configs-div').style.display = "none";
    document.getElementById('earnings-div').style.display = "block";
    document.getElementById('hotspot_list').style.display = 'none';
    document.getElementById('add_new_hotspot_div').style.display = 'none';
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
    let hotspots = localStorage.getItem("hotspots")

    if (hotspots == null || hotspots == undefined) {
        return
    }

    hotspots = JSON.parse(hotspots)
    let request = {
        "hotspots": hotspots
    }

    fetch(`${API_ENDPOINT}/api/v1/earnings`, {
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
    let earnings_resp = JSON.parse(localStorage.getItem('earnings_resp'))
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
    document.getElementById('last-day-window-usd').innerHTML = `$ ${(last_24_hours * price).toFixed(2)}`;

    document.getElementById('last-7-day-window-hnt').innerHTML = `${last_7_days.toFixed(2)} HNT`;
    document.getElementById('last-7-day-window-usd').innerHTML = `$ ${(last_7_days * price).toFixed(2)}`;

    document.getElementById('summary-window-hnt').innerHTML = `${last_30_days.toFixed(2)} HNT`;
    document.getElementById('summary-window-usd').innerHTML = `$ ${(last_30_days * price).toFixed(2)}`;
}

function getStatus(data, is_cumulative) {
    if (is_cumulative) {
        return data['status']
    } else {
        return data['device_details']['status']
    }
}