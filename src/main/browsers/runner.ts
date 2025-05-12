import { BrowserWindow, WebContentsView } from 'electron'

export default () => {
  let view: WebContentsView | undefined
  const createView = (plugin, window: BrowserWindow) => {
    const {
      // plugin 的 入口 html 路径
      indexPath,
      // plugin 的预加载脚本路径
      preload
    } = plugin
    //自窗口设置嵌入式子窗口
    view = new WebContentsView({
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
        contextIsolation: false,
        // 加载 preload.js
        preload
      }
    })
    window.contentView.addChildView(view)
    //加载页面
    view.webContents.loadURL(indexPath)
    // 监听 dom-ready 事件
    view.webContents.once('dom-ready', () => {
      console.log('dom-ready')
      // 设置 x，y 坐标，窗口宽度和高度
      view?.setBounds({ x: 0, y: 0, width: 300, height: 300 })
    })
  }
  const removeView = (window: BrowserWindow) => {
    if (!view) return
    view.webContents.close()
    view.webContents.removeAllListeners()
    window.contentView.removeChildView(view)
    view = undefined
  }
  const getView = (view) => view
  return {
    createView,
    removeView,
    getView
  }
}
