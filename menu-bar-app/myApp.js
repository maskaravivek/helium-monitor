const { menubar } = require('menubar');
const path = require('path');
const { app, ipcMain, autoUpdater } = require('electron')

// const UPDATE_CHECK_INTERVAL = 10 * 60 * 1000

// const server = "https://hazel-ten-rho.vercel.app"
// const feed = `${server}/update/${process.platform}/${app.getVersion()}`

// autoUpdater.setFeedURL(feed)

// setInterval(() => {
//   autoUpdater.checkForUpdates()
// }, UPDATE_CHECK_INTERVAL)

// autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
//   const dialogOpts = {
//     type: 'info',
//     buttons: ['Restart', 'Later'],
//     title: 'Application Update',
//     message: process.platform === 'win32' ? releaseNotes : releaseName,
//     detail: 'A new version has been downloaded. Restart the application to apply the updates.'
//   }

//   dialog.showMessageBox(dialogOpts).then((returnValue) => {
//     if (returnValue.response === 0) autoUpdater.quitAndInstall()
//   })
// })

app.commandLine.appendSwitch('ignore-certificate-errors', true);

const mb = menubar({
  showDockIcon: false,
  icon: path.join(__dirname, 'assets', 'icon.png'),
  browserWindow: {
    width: 640,
    height: 420,
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
  //  mb.window.openDevTools()
})

ipcMain.on('bmc-event', (event, arg) => {
  event.returnValue = 'Message received!'
  require('electron').shell.openExternal('https://www.buymeacoffee.com/maskara');
})

ipcMain.on('new-hotspot-event', (event, arg) => {
  event.returnValue = 'Message received!'
  require('electron').shell.openExternal('https://www.nebra.com/?ref=i0nmbh_csmsh');
})

ipcMain.on('hotspot-event', (event, arg) => {
  event.returnValue = 'Message received!'
  require('electron').shell.openExternal(`https://explorer.helium.com/hotspots/${arg}`);
})