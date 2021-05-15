window.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('save_btn').addEventListener("click", function () {
        let hotspot_id_input_val = document.getElementById('hotspot_id').value
        localStorage.setItem('hotspot_id', hotspot_id_input_val)
        showEarningsDiv()
        displayEarnings(hotspot_id_input_val)
    });

    document.getElementById('edit_configs').addEventListener("click", function () {
        displayConfigs();
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
            let latest = document.getElementById('latest-window')
            latest.innerHTML = data['latest_window']

            let last_day = document.getElementById('last-day-window')
            last_day.innerHTML = data['last_day']

            let summary = document.getElementById('summary-window')
            summary.innerHTML = data['summary_window']

            let earnings = data['summary_window'] * data['price']

            let total_earnings = document.getElementById('total_earnings')
            total_earnings.innerHTML = `(${earnings.toFixed(2)} $)`
        });
}