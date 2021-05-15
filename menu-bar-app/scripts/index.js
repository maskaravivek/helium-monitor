window.addEventListener('DOMContentLoaded', (event) => {
    fetch('https://helium-monitor.herokuapp.com/api/v1/earnings?hotspot_id=11MqWgd3Hn3HMnJt8Mrw1QFjZqcCh1febgUNk4YaDEjm5fQXAmQ')
        .then(response => response.json())
        .then(data => {
            let latest = document.getElementById('latest-window')
            latest.innerHTML = data['latest_window']

            let last_day = document.getElementById('last-day-window')
            last_day.innerHTML = data['last_day']

            let summary = document.getElementById('summary-window')
            summary.innerHTML = data['summary_window']
        });

    // let latest = document.getElementById('latest-window')
    // latest.innerHTML = "hello"
});


