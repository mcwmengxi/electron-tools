import { BrowserWindow, WebContentsView } from 'electron'
import envHelper from '../../common/utils/envHelper'
import path from 'path'
import { PLUGIN_INSTALL_DIR as baseDir } from '../../common/constants/main'
import { getStaticPath } from '../../common/utils'
import { WINDOW_HEIGHT, WINDOW_PLUGIN_HEIGHT, WINDOW_WIDTH } from '../../common/constants/common'

export default () => {
  let view: WebContentsView | undefined

  const getRelativePath = (indexPath) => {
    return envHelper.windows() ? indexPath.replace('file://', '') : indexPath.replace('file:', '')
  }
  const getPreloadPath = (plugin, pluginIndexPath) => {
    const { name, preload, tplPath, indexPath } = plugin
    if (!preload) return
    if (envHelper.dev()) {
      if (name === 'rubick-system-feature') {
        return path.resolve(getStaticPath(), `../out/preload/index.js`)
        // return path.resolve(getStaticPath(), `../feature/public/preload.js`)
      }
      if (tplPath) {
        return path.resolve(getRelativePath(indexPath), `./`, preload)
      }
      return path.resolve(getRelativePath(pluginIndexPath), `../`, preload)
    }
    if (tplPath) {
      return path.resolve(getRelativePath(indexPath), `./`, preload)
    }
    return path.resolve(getRelativePath(pluginIndexPath), `../`, preload)
  }
  const init = (plugin, window: BrowserWindow) => {
    if (view === null || view === undefined) {
      // 初始化插件
      createView(plugin, window)
    }
  }
  const viewReadyFn = (window: BrowserWindow, plugin) => {
    if (!view) return
    const { pluginSetting, ext } = plugin
    const height = pluginSetting?.height
    window.setSize(WINDOW_WIDTH, height || WINDOW_PLUGIN_HEIGHT)
    // 设置 x，y 坐标，窗口宽度和高度
    view?.setBounds({
      x: 0,
      y: WINDOW_HEIGHT,
      width: WINDOW_WIDTH,
      height: height || WINDOW_PLUGIN_HEIGHT - WINDOW_HEIGHT
    })

    // autoresize
    window.on('resize', () => {
      if (!view || !window) return
      const bounds = window.getBounds()
      view.setBounds({
        x: 0,
        y: 0,
        width: bounds.width,
        height: bounds.height
      })
    })
  }
  const createView = (plugin, window: BrowserWindow) => {
    const {
      tplPath,
      // plugin 的 入口 html 路径
      indexPath,
      // plugin 的预加载脚本路径
      // preload: rawPreload,
      development,
      main = 'index.html',
      name
    } = plugin
    let pluginIndexPath = tplPath || indexPath
    let preloadPath
    if (envHelper.dev()) {
      plugin.indexPath = development
      const pluginPath = path.resolve(baseDir, 'node_modules', name)
      preloadPath = `file://${path.join(pluginPath, './', main)}`
    }
    // 再尝试去找
    if (plugin.name === 'rubick-system-feature' && !pluginIndexPath) {
      pluginIndexPath = envHelper.dev()
        ? 'http://localhost:8081/#/'
        : `file://${getStaticPath}/feature/index.html`
    }
    if (!pluginIndexPath) {
      const pluginPath = path.resolve(baseDir, 'node_modules', name)
      pluginIndexPath = `file://${path.join(pluginPath, './', main)}`
    }

    const preload = getPreloadPath(plugin, preloadPath || pluginIndexPath)

    //自窗口设置嵌入式子窗口
    view = new WebContentsView({
      webPreferences: {
        webSecurity: false,
        // nodeIntegration: false,
        // contextIsolation: true,
        sandbox: false,
        devTools: true,
        // 加载 preload.js
        preload
      }
    })
    window.contentView.addChildView(view)
    //加载页面
    view.webContents.loadURL(pluginIndexPath)
    // 监听 dom-ready 事件
    view.webContents.once('dom-ready', () => viewReadyFn(window, plugin))
    // 添加调试工具
    view.webContents.on('did-finish-load', () => {
      view!.webContents.openDevTools({
        mode: 'right' // 也可以使用 'detach' 或 'bottom'
      })
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
    init,
    createView,
    removeView,
    getView
  }
}
