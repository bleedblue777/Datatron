const {app, BrowserWindow, ipcMain} = require('electron')
const {autoUpdater} = require("electron-updater");
const path = require('path')
const url = require('url')

let window = null

// Wait until the app is ready
app.once('ready', () => {
  // Create a new window
  window = new BrowserWindow({
    // Set the initial width to 500px
    width: 1000,
    // Set the initial height to 400px
    height: 800,
    // set the title bar style
    titleBarStyle: 'hidden-inset',
    // set the background color to black
    backgroundColor: "#111",
    // Don't show the window until it's ready, this prevents any white flickering
    show: false
  })

  window.loadURL(url.format({
    pathname: path.join(__dirname, 'login.html'),
    protocol: 'file:',
    slashes: true
  }))

  window.once('ready-to-show', () => {
    window.show()
  })

  autoUpdater.checkForUpdates();
})

// when the update has been downloaded and is ready to be installed, notify the BrowserWindow
autoUpdater.on('update-downloaded', (info) => {
    win.webContents.send('updateReady')
});

// when receiving a quitAndInstall signal, quit and install the new version ;)
ipcMain.on("quitAndInstall", (event, arg) => {
    autoUpdater.quitAndInstall();
})

app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});
