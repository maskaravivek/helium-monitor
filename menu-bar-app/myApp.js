const { menubar } = require('menubar');
const path = require('path');
const { app, ipcMain } = require('electron')

const { app, autoUpdater } = require('electron')

const server = "https://hazel-ten-rho.vercel.app"
const feed = `${server}/update/${process.platform}/${app.getVersion()}`

autoUpdater.setFeedURL(feed)

const mb = menubar({
  showDockIcon: false,
  icon: path.join(__dirname, 'assets', 'icon.png'),
  browserWindow: {
    width: 440,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  },
  preloadWindow: true,
  tooltip: 'Helium Hotspot Monitor'
});

mb.on('ready', () => {
  console.log('app is ready');
});

mb.on('after-create-window', () => {
  // mb.window.openDevTools()
})

ipcMain.on('bmc-event', (event, arg) => {
  event.returnValue = 'Message received!'
  require('electron').shell.openExternal('https://www.buymeacoffee.com/maskara');
})