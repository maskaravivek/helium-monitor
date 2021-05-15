const { menubar } = require('menubar');
const path = require('path');


const mb = menubar({
  showDockIcon: false,
  icon: path.join(__dirname, 'assets', 'icon.png'),
  browserWindow: {
    width: 440,
    height: 400
  },
  tooltip: 'Helium Hotspot Monitor'
});

mb.on('ready', () => {
  console.log('app is ready');
  // mb.tray.setTitle('woo!')
  // your app code here
});

mb.on('after-create-window', () => {
  // mb.window.openDevTools()
})