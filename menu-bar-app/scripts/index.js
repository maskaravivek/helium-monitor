const EMRIT_RATIO = 0.2

window.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('save_btn').addEventListener("click", function () {
        let hotspot_name_input_val = document.getElementById('hotspot_name').value
        let is_emrit = document.getElementById("is_emrit").checked
        localStorage.setItem('hotspot_name', hotspot_name_input_val)
        localStorage.setItem('is_emrit', is_emrit)
        showEarningsDiv()
        displayEarnings(hotspot_name_input_val)
    });

    document.getElementById('edit_configs').addEventListener("click", function () {
        displayConfigs();
    });

    document.getElementById('coffee_btn').addEventListener("click", function () {
        require("shell").openExternal("http://www.google.com")
    });

    document.getElementById('refresh_btn').addEventListener("click", function () {
        displayHotspotEarnings();
    });

    let hotspot_name = localStorage.getItem('hotspot_name')
    if (hotspot_name === null || hotspot_name === undefined) {
        showConfigsDiv();
    } else {
        displayHotspotEarnings()
    }
});

window.addEventListener('focus', (event) => {
    console.log('focus')
    displayHotspotEarnings();
});

function displayConfigs() {
    showConfigsDiv();
    let hotspot_name = localStorage.getItem('hotspot_name');
    if (hotspot_name !== undefined && hotspot_name !== null) {
        document.getElementById('hotspot_name').value = localStorage.getItem('hotspot_name');
        document.getElementById('is_emrit').checked = localStorage.getItem('is_emrit') === "true";
    }
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
    let hotspot_name = localStorage.getItem('hotspot_name');
    showEarningsDiv();
    showLoadingIndicator(true)
    displayEarnings(hotspot_name);
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

function displayEarnings(hotspot_name) {
    fetch(`https://helium-monitor.herokuapp.com/api/v1/earnings?hotspot_name=${hotspot_name}`)
        .then(response => response.json())
        .then(data => {
            let is_emrit = localStorage.getItem('is_emrit') == "true"

            const last_1_hour = is_emrit ? (data['latest_window'] * EMRIT_RATIO) : data['latest_window'];
            const last_24_hours = is_emrit ? (data['last_day'] * EMRIT_RATIO) : data['last_day'];
            const last_7_days = is_emrit ? (data['7_days_window'] * EMRIT_RATIO) : data['7_days_window'];
            const last_30_days = is_emrit ? (data['summary_window'] * EMRIT_RATIO) : data['summary_window'];

            if (data['device_details']['status'] === "offline") {
                document.getElementById('status_icon').src = 'assets/offline.png'
            } else {
                document.getElementById('status_icon').src = 'assets/online.png'
            }

            if (last_1_hour > 0) {
                document.getElementById('last-1-hour-hnt').style.display = 'block'
                document.getElementById('last-1-hour-hnt').innerHTML = `+ ${last_1_hour.toFixed(2)} HNT`
            } else {
                document.getElementById('last-1-hour-hnt').style.display = 'none'
            }

            document.getElementById('last-day-window-hnt').innerHTML = `${parseFloat(last_24_hours).toFixed(2)} HNT`
            document.getElementById('last-day-window-usd').innerHTML = `$ ${(last_24_hours * data['price']).toFixed(2)}`

            document.getElementById('last-7-day-window-hnt').innerHTML = `${parseFloat(last_7_days).toFixed(2)} HNT`
            document.getElementById('last-7-day-window-usd').innerHTML = `$ ${(last_7_days * data['price']).toFixed(2)}`

            document.getElementById('summary-window-hnt').innerHTML = `${parseFloat(last_30_days).toFixed(2)} HNT`
            document.getElementById('summary-window-usd').innerHTML = `$ ${(last_30_days * data['price']).toFixed(2)}`
        });
}