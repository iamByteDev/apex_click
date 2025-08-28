let isRunning = false

const startBtn = document.getElementById('startBtn') as HTMLButtonElement | null
const stopBtn = document.getElementById('stopBtn') as HTMLButtonElement | null
const statusRaw = document.getElementById('status')
const statusHolder = typeof statusRaw === 'string' ? null : (statusRaw as HTMLElement | null)
const statusText = statusHolder
  ? (statusHolder.querySelector('.status-text') as HTMLElement | null)
  : null
const intervalInput = document.getElementById('interval') as HTMLInputElement | null
const hotkeyInput = document.getElementById('hotkey') as HTMLInputElement | null

// Add ripple effect to buttons
function addRipple(e: MouseEvent): void {
  const button = e.currentTarget as HTMLElement | null
  if (
    !button ||
    typeof button.appendChild !== 'function' ||
    typeof button.getBoundingClientRect !== 'function'
  )
    return
  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const x = e.clientX - rect.left - size / 2
  const y = e.clientY - rect.top - size / 2

  const ripple = document.createElement('span')
  ripple.className = 'ripple'
  ripple.style.width = ripple.style.height = size + 'px'
  ripple.style.left = x + 'px'
  ripple.style.top = y + 'px'

  button.appendChild(ripple)

  setTimeout(() => ripple.remove(), 600)
}

startBtn?.addEventListener('click', addRipple)
stopBtn?.addEventListener('click', addRipple)

startBtn?.addEventListener('click', () => {
  if (!isRunning) {
    // Here you would integrate with your Electron main process
    console.log('Starting autoclicker')
    setTimeout(() => {
      window.electron.ipcRenderer.send('autoclick:start')
    }, 1000)
  }
})

window.electron.ipcRenderer.on('autoclick:started', () => {
  isRunning = true
  if (statusHolder) statusHolder.classList.add('active')
  if (statusText) statusText.textContent = 'Running...'
  if (startBtn) {
    startBtn.textContent = 'Running'
    startBtn.style.opacity = '0.7'
  }
})

stopBtn?.addEventListener('click', () => {
  if (isRunning) {
    // Here you would integrate with your Electron main process
    console.log('Stopping autoclicker')
    window.electron.ipcRenderer.send('autoclick:stop')
  }
})

window.electron.ipcRenderer.on('autoclick:stopped', (_, clickCount) => {
  isRunning = false
  if (statusHolder) statusHolder.classList.remove('active')
  if (statusText) statusText.textContent = `Stopped - ${clickCount} clicks performed`
  if (startBtn) {
    startBtn.textContent = 'Start'
    startBtn.style.opacity = '1'
  }
})

// Hotkey input handling (UI only - no actual detection)
let isRecordingHotkey = false

hotkeyInput?.addEventListener('click', () => {
  if (!isRecordingHotkey && hotkeyInput) {
    isRecordingHotkey = true
    hotkeyInput.value = ''
    hotkeyInput.placeholder = 'Press keys...'
    hotkeyInput.style.background = 'rgba(255, 255, 255, 0.25)'
    hotkeyInput.style.borderColor = 'rgba(255, 255, 255, 0.4)'
    // Simulate recording for demo (you would implement actual key detection)
    setTimeout(() => {
      if (hotkeyInput) {
        hotkeyInput.value = 'F6' // Example hotkey
        hotkeyInput.placeholder = 'Click to set hotkey'
        hotkeyInput.style.background = 'rgba(255, 255, 255, 0.15)'
        hotkeyInput.style.borderColor = 'rgba(255, 255, 255, 0.1)'
      }
      isRecordingHotkey = false
    }, 2000)
  }
})

hotkeyInput?.addEventListener('blur', () => {
  if (isRecordingHotkey && hotkeyInput) {
    hotkeyInput.placeholder = 'Click to set hotkey'
    hotkeyInput.style.background = 'rgba(255, 255, 255, 0.15)'
    hotkeyInput.style.borderColor = 'rgba(255, 255, 255, 0.1)'
    isRecordingHotkey = false
  }
})

// Validate inputs
function syncIntervalInput() {
  const target = intervalInput
  if (!target) return

  const value = parseInt(target.value)
  if (value < 1) target.value = '1'
  if (value > 60000) target.value = '60000'
  window.electron.ipcRenderer.send('autoclick:setinterval', value)
}

intervalInput?.addEventListener('input', (e: Event) => {
  const target = e.target as HTMLInputElement | null
  if (!target) return
  syncIntervalInput()
})

syncIntervalInput()
