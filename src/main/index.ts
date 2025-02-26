import electron, { app, shell, BrowserWindow, ipcMain, protocol } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import API from './common/api'
import Detch from './browsers/detch'
import SearchPlugin from '../core/app-search/index'
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
      { scheme: 'app', privileges: { secure: true, standard: true } }
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
      await localConfig.init()
      const config = await localConfig.getConfig()
      console.log(config, '--------')
      if (!config.perf.common.guide) {
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
      await SearchPlugin.getSearchList?.()
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
