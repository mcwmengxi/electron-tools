import { app, BrowserWindow, ipcMain, Notification, screen } from 'electron'
import DBInstance from './db'
import pluginInstance from '../browsers/plugin-instance'
import path from 'node:path'
import { PLUGIN_INSTALL_DIR as baseDir } from '../../common/constants/main'
import envHelper from '../../common/utils/envHelper'
import SearchPlugin from '../../core/app-search/index'
import { exec } from 'node:child_process'
import { runner } from '../browsers'
import { downloadImageToTemp } from '../../common/utils/file'

const staticPath = path.join(app.getAppPath(), 'resources')
const PluginBasePathMap = {
  static: staticPath
}
const runnerInstance = runner()
class API extends DBInstance {
  init(mainWindow: BrowserWindow): void {
    // 响应 preload.js 事件
    ipcMain.on('msg-trigger', async (event, args) => {
      const window = args.winId ? BrowserWindow.fromId(args.winId) : mainWindow
      try {
        const data = await this[args.type](args, window, event)
        event.returnValue = data
      } catch (error) {
        console.log(args.type, '未声明', error, this[args.type])
      }
    })
    // 按 ESC 退出插件
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'Escape') {
        console.log('ESC', '触发了')

        // mainWindow.webContents.send('closePlugin')
      }
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
  public setExpendHeight({ data: height }, window, e) {
    const originWindow = this.getCurrentWindow(window, e)
    if (!originWindow) return
    const targetHeight = height
    const originWidth = originWindow.getSize()[0]
    originWindow.setSize(originWidth, targetHeight)

    // 当前鼠标的绝对位置
    const screenPoint = screen.getCursorScreenPoint()
    // 返回离指定点最近的 display.
    const display = screen.getDisplayNearestPoint(screenPoint)
    // 当前窗口的位置
    const position = originWindow.getPosition()
    const newPosition = position[1] + targetHeight > display.bounds.height ? height - 60 : 0

    console.log('setExpendHeight', targetHeight)
    originWindow.webContents.executeJavaScript(
      `window.setPosition && typeof window.setPosition === "function" && window.setPosition(${newPosition})`
    )
  }
  public showNotification({ data: { body } }) {
    if (!Notification.isSupported()) return
    'string' != typeof body && (body = String(body))
    const plugin = this.currentPlugin
    const notification = new Notification({
      title: plugin?.name || null,
      body,
      icon: plugin?.logo || null
    })
    notification.show()
  }

  /**
   * @desc 初始化插件实例
   */
  public async initPluginInstance() {
    pluginInstance().init()
  }
  /**
   * @desc 获取插件信息
   */
  public getPluginInfo = async ({ data }) => {
    const { pluginName, pluginPath, pluginBaseKey } = data
    const pathRes = path.resolve(PluginBasePathMap[pluginBaseKey], pluginPath)
    const res = await pluginInstance().getPluginInfo({ pluginName, pluginPath: pathRes })
    global.LOCAL_PLUGINS.addPlugin(res)
    return res
  }
  /**
   * @desc 更新插件
   */
  public upgradePlugin = async ({ data }) => {
    const { name } = data
    const res = await pluginInstance().upgrade(name)
    return res
  }
  /**
   * @desc 安装插件
   */
  public async getLocalPlugins() {
    const res = await global.LOCAL_PLUGINS.getLocalPlugins()
    return res
  }

  /**
   * @desc 打开插件
   */

  public async openPlugin({ data }, window) {
    const { plugin, option } = data
    let iconPath = plugin.logo

    // 如果是网络图片则下载到临时目录
    if (plugin.logo?.startsWith('http')) {
      try {
        iconPath = await downloadImageToTemp(plugin.logo)
      } catch (e) {
        console.error('下载通知图标失败:', e)
        iconPath = null
      }
    }
    console.log(process.platform)
    return new Notification({
      title: `插件不支持当前 ${process.platform} 系统`,
      body: `插件仅支持 ${plugin.platform?.join(',')}`,
      icon: iconPath
    }).show()
    // const { plugin, option } = data
    // const pluginDist = { ...plugin }
    // // 处理路径
    // const pluginPath = path.resolve(baseDir, 'node_modules', plugin.name)
    // pluginDist.indexPath = `file://${path.join(pluginPath, './', plugin.main || '')}`
    // const getIndexPath = (baseName: string) => {
    //   const IdxPath = path.join(app.getAppPath(), 'resources', baseName, '/index.html')
    //   return `file://${IdxPath}`
    // }
    // // 模板文件
    // if (!plugin.main) {
    //   pluginDist.tplPath = envHelper.dev() ? 'http://localhost:8083/#/' : getIndexPath('tpl')
    // }
    // // 插件市场
    // if (plugin.name === 'rubick-system-feature') {
    //   pluginDist.indexPath = envHelper.dev() ? 'http://localhost:8081/#/' : getIndexPath('feature')
    // }

    // // 移除插件 removePlugin
    // // window.initRubick();

    // if (plugin.pluginType === 'ui' || plugin.pluginType === 'system') {
    //   if (state.currentPlugin && state.currentPlugin.name === plugin.name) {
    //     window.rubick.showMainWindow()
    //     return
    //   }
    //   await loadPlugin(plugin)
    // }
  }

  public loadPlugin({ data }, window, event) {
    const { load = true } = data
    // 发送渲染进程 触发loadPlugin
    if (load) {
      event.sender.send('loadPlugin', {
        data: { ...data }
      })
    }
    this.openPlugin({ data }, window)
  }
  public removePlugin(_, window, event) {
    runnerInstance.removeView(window)
    this.currentPlugin = null
  }
  /**
   * @desc 获取插件
   */
  public async getPlugins({ data }) {
    return (await SearchPlugin.getSearchList?.()) ?? []
  }

  public execApp({ data }) {
    const { action } = data
    return exec(action)
  }
}

export default new API()
