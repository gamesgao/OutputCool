// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const uuid = require('uuid')
const ipc = require('electron').ipcRenderer
let win = require('electron').remote.getCurrentWindow()
ipc.send('connection')
let delayPool = []
let restartFlag = false
ipc.on('init', (event, arg) => {
  APP.texts.unshift({
    data: arg,
    key: uuid.v1()
  })
})

ipc.on('data', (event, arg) => {
  if (restartFlag) {
    APP.texts.unshift({
      data: arg,
      key: uuid.v1()
    })
    restartFlag = false
  } else {
    delayPool.push({
      data: arg,
      key: uuid.v1()
    })
  }
})

APP.$on('change', () => {
  win.setSize(APP.$el.scrollWidth + 10, APP.$el.scrollHeight + 10)
  if (delayPool.length === 0) {
    restartFlag = true
  } else {
    APP.texts.unshift(delayPool.shift())
  }
})
