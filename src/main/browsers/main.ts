import { BrowserWindow, protocol, shell } from 'electron'

import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../../resources/icon.png?asset'
export default () => {
  let mainWindow: BrowserWindow

  const init = () => {
    createWindow()
  }

  function createWindow(): BrowserWindow {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: 900,
      height: 670,
      show: false,
      autoHideMenuBar: true,
      frame: false,
      titleBarStyle: 'hidden',
      // 在windows上，设置默认显示窗口控制工具
      // titleBarOverlay: { color: '#fff', symbolColor: 'black' },
      // 设置 macOS 下红绿灯的位置
      trafficLightPosition: { x: 12, y: 21 },
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    mainWindow.on('ready-to-show', () => {
      // 确保用户看到的是完全加载并准备好的界面
      mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      // 开发环境，通过 loadURL 加载 devServer
      mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      // 生产环境，加载构建后的文件
      mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
    // 设置 CSP
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src * 'self' 'unsafe-inline' 'unsafe-eval' https://gitee.com; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src * 'self' data: https: app://*; connect-src * 'self'  http: blob: https: https://gitee.com;"
          ]
        }
      })
    })
    // protocol.interceptFileProtocol('image', (req, callback) => {
    //   const url = req.url.substr(8)
    //   console.log(url, 'image')
    //   callback(decodeURI(url))
    // })
    return mainWindow
  }
  const getWindow = () => mainWindow

  return {
    init,
    getWindow
  }
}
