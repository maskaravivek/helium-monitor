const electron = require('electron')
const ipc = electron.ipcRenderer

window.addEventListener('DOMContentLoaded', () => {
    coffee_btn = document.getElementById('coffee_btn');
    new_hotspot_link = document.getElementById('new_hotspot_link');
    web_btn = document.getElementById('web_btn');
    emrit_hotspot_link = document.getElementById('emrit_hotspot_link');

    if (coffee_btn) {   
        coffee_btn.addEventListener("click", function () {
            const reply = ipc.sendSync('bmc-event', 'Open BMC link in browser')
        });
    }

    if (new_hotspot_link) { 
        new_hotspot_link.addEventListener("click", function () {
            const reply = ipc.sendSync('new-hotspot-event', 'New hotspot')
        });
    }

    if (web_btn) { 
        web_btn.addEventListener("click", function () {
            let active_hotspot_id = localStorage.getItem('active_hotspot_id')
            const reply = ipc.sendSync('hotspot-event', active_hotspot_id)
        });
    }

    if (emrit_hotspot_link) { 
        emrit_hotspot_link.addEventListener("click", function () {
            const reply = ipc.sendSync('emrit-signup-event', 'New Emrit Hotspot')
        });
    }
})

