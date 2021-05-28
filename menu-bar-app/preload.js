const electron = require('electron')
const ipc = electron.ipcRenderer

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('coffee_btn').addEventListener("click", function () {
        const reply = ipc.sendSync('bmc-event', 'Open BMC link in browser')
    });

    document.getElementById('web_btn').addEventListener("click", function () {
        let active_hotspot_id = localStorage.getItem('active_hotspot_id')
        const reply = ipc.sendSync('hotspot-event', active_hotspot_id)
    });
})

