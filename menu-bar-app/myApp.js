const { menubar } = require('menubar');

const mb = menubar({
  showDockIcon: false,
  icon: 'assets/icon.png',
  browserWindow: {
    width: 440,
    height: 340
  },
  tooltip: 'Helium Hotspot Monitor'
});

mb.on('ready', () => {
  console.log('app is ready');
  // your app code here
});

mb.on('after-create-window', () => {
  // mb.window.openDevTools()
})