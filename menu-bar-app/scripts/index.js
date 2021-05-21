const EMRIT_RATIO = 0.2

window.addEventListener('DOMContentLoaded', (event) => {
    migrateOldData()
    attachEventHandlers();
    showEarningsOrConfigs();
});

function showEarningsOrConfigs() {
    if (hasSavedHotspots()) {
        displayHotspotEarnings();
    } else {
        showConfigsDiv();
    }
}

function attachEventHandlers() {
    document.getElementById('save_btn').addEventListener("click", function () {
        let hotspot_name_input_val = document.getElementById('hotspot_name').value;
        let is_emrit = document.getElementById("is_emrit").checked;
        addOrEditConfig(hotspot_name_input_val, is_emrit);
        displayHotspotEarnings();
    });

    document.getElementById('edit_configs').addEventListener("click", function () {
        displayConfigs();
    });

    document.getElementById('refresh_btn').addEventListener("click", function () {
        displayHotspotEarnings();
    });
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
    let hotspots = localStorage.getItem("hotspots")

    if (hotspots !== null && hotspots !== undefined) {
        hotspots = JSON.parse(hotspots)
    }

    hotspots[hotspot_name] = is_emrit;
    localStorage.setItem("hotspots", JSON.stringify(hotspots))
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
        localStorage.setItem("is_migrated", true)
    }
}

window.addEventListener('focus', (event) => {
    displayHotspotEarnings();
});

function displayConfigs() {
    showConfigsDiv();
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
    setTimeout(function () { showLoadingIndicator(false); }, 300)
}

function showConfigsDiv() {
    document.getElementById('configs-div').style.display = "block";
    document.getElementById('earnings-div').style.display = "none";
}

function showEarningsDiv() {
    document.getElementById('configs-div').style.display = "none";
    document.getElementById('earnings-div').style.display = "block";
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

    fetch('https://helium-monitor.herokuapp.com/api/v1/earnings', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(request)
    })
        .then(response => response.json())
        .then(data => {
            displayEarnings(data["cumulative"], true);
        })
        .catch(err => {
            console.log(err)
        })
}

function displayEarnings(data, is_cumulative) {
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