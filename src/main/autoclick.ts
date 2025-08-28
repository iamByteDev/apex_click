import robotjs from '@hurdlegroup/robotjs'
import { app, globalShortcut, ipcMain, webContents } from 'electron'

function sendIPCMessage(channel: string, ...args: any[]) {
  const allWebContents = webContents.getAllWebContents()
  for (const webContent of allWebContents) {
    webContent.send(channel, args)
  }
}

// INTERVAL //
let interval = 100

function setClickInterval(ms: number) {
  interval = ms
  console.log('interval set to', ms)
}

// AUTOCLICK //

let intervalId: NodeJS.Timeout | null = null
let clickCount = 0

function click() {
  robotjs.mouseClick('left')
  clickCount++
}

function startAutoclick(): boolean {
  if (intervalId === null) {
    clickCount = 0

    intervalId = setInterval(click, interval)

    sendIPCMessage('autoclick:started')

    console.log('started autoclick')
    return true
  } else {
    console.log('failed to start autoclick')
    return false
  }
}

function stopAutoclick(): boolean {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null

    sendIPCMessage('autoclick:stopped', clickCount)

    console.log('stopped autoclick')
    return true
  } else {
    console.log('failed to stop autoclick')
    return false
  }
}

function toggleAutoclick() {
  if (intervalId === null) {
    startAutoclick()
  } else if (intervalId !== null) {
    stopAutoclick()
  }
}

// HOTKEY //
app.whenReady().then(() => {
  // Register a 'CommandOrControl+X' shortcut listener.
  globalShortcut.register('`', () => {
    toggleAutoclick()
  })
})

// IPC //

ipcMain.on('autoclick:setinterval', (_event, ms: number) => {
  setClickInterval(ms)
})

ipcMain.on(`autoclick:start`, () => {
  startAutoclick()
})
ipcMain.on(`autoclick:stop`, () => {
  stopAutoclick()
})

// const id = setInterval(startAutoclick, 1)
// setTimeout(() => {
//   clearInterval(id)
// }, 20000)
