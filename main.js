const electron = require('electron')
// Module to control application life.
const app = electron.app
const ipc = electron.ipcMain
const Tray = electron.Tray
const Menu = electron.Menu
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const httpServer = require('http').createServer()
const io = require('socket.io')(httpServer)

httpServer.listen(6000)

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindows = []

io.on('connection', (socket) => {
  createWindow(socket)
})

function createWindow (socket) {
  // Create the browser window.
  let mainWindow = new BrowserWindow({
    fullscreen: false,
    useContentSize: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    frame: false,
    transparent: true,
    movable: true,
    center: true,
    resizable: true,
    minimizable: false
  })

  // mainWindow.setIgnoreMouseEvents(true, {forward: true})
  // mainWindow.setIgnoreMouseEvents(true)

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  // console.log(mainWindow.webContents)
  // mainWindow.webContents.executeJavaScript()
  ipc.once('connection', (event, arg) => {
    event.sender.send('init', '新输入源')
    socket.on('data', (data) => {
      event.sender.send('data', data)
    })
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  mainWindows.push(mainWindow)
  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindows.splice(mainWindows.indexOf(mainWindow), 1)
  })

  socket.on('disconnect', () => {
    mainWindow.close()
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
let appIcon
app.on('ready', () => {
  appIcon = new Tray(path.join(__dirname, './favicon.ico'))
  var contextMenu = Menu.buildFromTemplate([
    {
      type: 'normal',
      label: 'exit',
      role: 'quit'
    }
  ])
  appIcon.setToolTip('OutputCool')
  appIcon.setContextMenu(contextMenu)
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  // if (mainWindow === null) {
  //   createWindow()
  // }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
