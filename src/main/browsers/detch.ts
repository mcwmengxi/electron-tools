import { BrowserWindow, ipcMain } from 'electron'

export default () => {
  let win: BrowserWindow
  const init = () => {
    ipcMain.on('detach:service', async (event, args) => {
      win = BrowserWindow.fromWebContents(event.sender) as BrowserWindow

      const data = await operation[args.type]()
      event.returnValue = data
    })
  }
  const operation = {
    minimize: () => {
      win.focus()
      win.minimize()
    },
    maximize: () => {
      win.isMaximized() ? win.unmaximize() : win.maximize()
    },
    close: () => {
      win.close()
    },
    endFullScreen: () => {
      win.isFullScreen() && win.setFullScreen(false)
    }
  }

  return {
    init
  }
}
