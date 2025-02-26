import { BrowserWindow, ipcMain, Notification, screen } from 'electron'

class API {
  init(mainWindow: BrowserWindow): void {
    // 响应 preload.js 事件
    ipcMain.on('msg-trigger', async (event, args) => {
      const window = args.winId ? BrowserWindow.fromId(args.winId) : mainWindow

      const data = await this[args.type](args, window, event)

      event.returnValue = data
    })
  }
  public getVersion(): string {
    return '1.0.0'
  }
  public getCurrentWindow = (window, e): BrowserWindow | null => {
    let originWindow = BrowserWindow.fromWebContents(e.sender)
    if (originWindow !== window) originWindow = null
    return originWindow
  }
  public windowMoving({ data }, window, e): void {
    // 获取当前鼠标的绝对位置。
    const { x, y } = screen.getCursorScreenPoint()
    // 计算窗口的新位置。
    const newX = x - data.mouseX
    const newY = y - data.mouseY
    const originWindow = this.getCurrentWindow(window, e)
    if (!originWindow) return
    originWindow.setBounds({
      x: newX,
      y: newY,
      width: data.width,
      height: data.height
    })
  }
  public showNotification({ data: { body } }) {
    if (!Notification.isSupported()) return
    const notification = new Notification({
      title: '标题',
      body,
      icon: ''
    })
    notification.show()
  }
}

export default new API()
