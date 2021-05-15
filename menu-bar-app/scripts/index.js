const EMRIT_RATIO = 0.2

window.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('save_btn').addEventListener("click", function () {
        let hotspot_id_input_val = document.getElementById('hotspot_id').value
        let is_emrit = document.getElementById("is_emrit").checked
        localStorage.setItem('hotspot_id', hotspot_id_input_val)
        localStorage.setItem('is_emrit', is_emrit)
        showEarningsDiv()
        displayEarnings(hotspot_id_input_val)
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

    let hotspot_id = localStorage.getItem('hotspot_id')
    if (hotspot_id === null || hotspot_id === undefined) {
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
    let hotspot_id = localStorage.getItem('hotspot_id');
    if (hotspot_id !== undefined && hotspot_id !== null) {
        document.getElementById('hotspot_id').value = localStorage.getItem('hotspot_id');
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
    let hotspot_id = localStorage.getItem('hotspot_id');
    showEarningsDiv();
    showLoadingIndicator(true)
    displayEarnings(hotspot_id);
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

function displayEarnings(hotspot_id) {
    fetch(`https://helium-monitor.herokuapp.com/api/v1/earnings?hotspot_id=${hotspot_id}`)
        .then(response => response.json())
        .then(data => {
            let is_emrit = localStorage.getItem('is_emrit') == "true"

            const last_1_hour = is_emrit ? (data['latest_window'] * EMRIT_RATIO).toFixed(2) : data['latest_window'];
            const last_24_hours = is_emrit ? (data['last_day'] * EMRIT_RATIO).toFixed(2) : data['last_day'];
            const last_7_days = is_emrit ? (data['7_days_window'] * EMRIT_RATIO).toFixed(2) : data['7_days_window'];
            const last_30_days = is_emrit ? (data['summary_window'] * EMRIT_RATIO).toFixed(2) : data['summary_window'];

            if (last_1_hour > 0) {
                document.getElementById('last-1-hour-hnt').innerHTML = `+ ${last_1_hour} HNT`
            }

            document.getElementById('last-day-window-hnt').innerHTML = `${last_24_hours} HNT`
            document.getElementById('last-day-window-usd').innerHTML = `$ ${(last_24_hours * data['price']).toFixed(2)}`

            document.getElementById('last-7-day-window-hnt').innerHTML = `${last_7_days} HNT`
            document.getElementById('last-7-day-window-usd').innerHTML = `$ ${(last_7_days * data['price']).toFixed(2)}`

            document.getElementById('summary-window-hnt').innerHTML = `${last_30_days} HNT`
            document.getElementById('summary-window-usd').innerHTML = `$ ${(last_30_days * data['price']).toFixed(2)}`
        });
}