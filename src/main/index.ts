import electron, { app, shell, BrowserWindow, ipcMain, protocol, net } from 'electron'
import path, { join } from 'node:path'
import fs from 'fs-extra'
import url from 'node:url'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import API from './common/api'
import Detch from './browsers/detch'
// import SearchPlugin from '../core/app-search/index'
import registerSystemPlugin from './common/registerSystemPlugin'
import main from './browsers/main'
import envHelper from '../common/utils/envHelper'
import '../common/utils/localPlugins'
import localConfig from './common/initLocalConfig'
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

class App {
  public windowCreator: { init: () => void; getWindow: () => BrowserWindow }
  private systemPlugins: any

  constructor() {
    // 注册协议
    protocol.registerSchemesAsPrivileged([
      {
        scheme: 'app',
        privileges: {
          secure: true, // 让 Electron 信任这个方式就像信任网站的 HTTPS 一样
          supportFetchAPI: true, // 允许我们像在网页上那样请求资源
          standard: true, // 让这种方式的网址看起来像普通的网址
          bypassCSP: true, // 允许我们绕过一些安全限制
          stream: true // 允许我们以流的形式读取文件，这对于大文件很有用
        }
      }
    ])
    this.windowCreator = main()
    // 单实例运行
    const gotTheLock = app.requestSingleInstanceLock()
    if (!gotTheLock) {
      app.quit()
    } else {
      app.on('second-instance', (event, argv, workingDirectory) => {
        // mainWindow.restore() // 从最小化窗口恢复
        // mainWindow.show() // 从后台显示
      })
      // 注册系统插件
      this.systemPlugins = registerSystemPlugin()
      // 注册生命周期
      this.beforeReady()
      this.onReady()
      this.onRunning()
      this.onQuit()
    }
  }
  createWindow() {
    this.windowCreator.init()
  }
  beforeReady() {
    // ...
    // 触发 onBeforeReady
    // this.systemPlugins.triggerBeforeReadyHooks()
  }
  onReady() {
    const readyFunction = async () => {
      // 一个辅助函数，用于处理不同操作系统的文件路径问题
      function convertPath(originalPath) {
        const match = originalPath.match(/^\/([a-zA-Z])\/(.*)$/)
        if (match) {
          // 为 Windows 系统转换路径格式
          return `${match[1]}:/${match[2]}`
        } else {
          return originalPath // 其他系统直接使用原始路径
        }
      }

      // 这个需要在app.ready触发之后使用
      protocol.handle('app', async (request) => {
        const decodedUrl = decodeURIComponent(request.url.replace(new RegExp(`^app:/`, 'i'), ''))

        const fullPath = process.platform === 'win32' ? convertPath(decodedUrl) : decodedUrl

        const data = await fs.readFile(fullPath) // 异步读取文件内容
        return new Response(data) // 将文件内容作为响应返回

        // const filePath = req.url.slice('app://'.length)
        // console.log(filePath, 'app')
        // return net.fetch(url.pathToFileURL(path.join(__dirname, filePath)).toString())
      })

      await localConfig.init()
      const config = await localConfig.getConfig()

      if (!config?.perf?.common?.guide) {
        // 打开引导页 todo
      }
      // ...
      // 触发 onReady
      this.systemPlugins.triggerReadyHooks(
        Object.assign(electron, {
          mainWindow: this.windowCreator.getWindow(),
          API
        })
      )
    }
    // if (!app.isReady()) {
    //   app.on('ready', readyFunction);
    // } else {
    //   readyFunction();
    // }

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.whenReady().then(async () => {
      // Set app user model id for windows
      electronApp.setAppUserModelId('com.electron')

      readyFunction()

      // Default open or close DevTools by F12 in development
      // and ignore CommandOrControl + R in production.
      // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
      app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
      })

      // IPC test
      ipcMain.on('ping', () => console.log('pong'))
      this.createWindow()
      const window = this.windowCreator.getWindow()
      API.init(window)
      Detch().init()

      // todo
      // await SearchPlugin.getSearchList?.()
      app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) this.createWindow()
      })
    })
  }
  onRunning() {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      // ...
      // if (win) {
      //   if (win.isMinimized()) {
      //     win.restore();
      //   }
      //   win.focus();
      // }
    })
    app.on('activate', () => {
      if (!this.windowCreator.getWindow()) {
        this.createWindow()
      }
    })
    if (envHelper.windows()) {
      // app.setAppUserModelId(pkg.build.appId)
    }
    // 触发 onRunning
    // this.systemPlugins.triggerOnRunningHooks()
  }
  onQuit() {
    // Quit when all windows are closed, except on macOS. There, it's common
    // for applications and their menu bar to stay active until the user quits
    // explicitly with Cmd + Q.
    app.on('window-all-closed', () => {
      // macOS 系统上应用的窗口关闭了，并非完全退出这个应用
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    app.on('will-quit', () => {
      // ...
      // 触发 OnQuit
      // this.systemPlugins.triggerOnQuitHooks()
    })
  }
}

export default new App()
