const electron = require('electron')
const ipc = electron.ipcRenderer

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('coffee_btn').addEventListener("click", function () {
        const reply = ipc.sendSync('bmc-event', 'Open BMC link in browser')
    });
})

