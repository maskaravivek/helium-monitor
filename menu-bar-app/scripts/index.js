window.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('save_btn').addEventListener("click", function () {
        let hotspot_id_input_val = document.getElementById('hotspot_id').value
        localStorage.setItem('hotspot_id', hotspot_id_input_val)
        showEarningsDiv()
        displayEarnings(hotspot_id_input_val)
    });

    document.getElementById('edit_configs').addEventListener("click", function () {
        showConfigsDiv()
    });

    let hotspot_id = localStorage.getItem('hotspot_id')
    if (hotspot_id === null || hotspot_id === undefined) {
        showConfigsDiv();
    } else {
        showEarningsDiv();
        displayEarnings(hotspot_id)
    }
});


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
        });
}