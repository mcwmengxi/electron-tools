import { contextBridge, ipcRenderer, shell } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import os from 'node:os'
const ipcSendSync = (type, data?: object) => {
  const returnValue = ipcRenderer.sendSync('msg-trigger', {
    type,
    data
  })
  if (returnValue instanceof Error) throw returnValue
  return returnValue
}

const ipcSend = (type, data) => {
  ipcRenderer.send('msg-trigger', {
    type,
    data
  })
}
// Custom APIs for renderer
const api = {
  // platform: process.platform
  GET_LOCAL_PLUGINS: () => {
    return global.LOCAL_PLUGINS
  }
}
const app = {
  onLoadPlugin: (cb: () => void) => ipcRenderer.on('loadPlugin', cb)
}

class Tools {
  private hooks: Record<string, any> = {}
  private __event__: Record<string, unknown> = {}
  public db: any = {}
  constructor() {
    //db
    Object.assign(this.db, {
      get: (id) => ipcSendSync('dbGet', { id }),
      put: (data) => ipcSendSync('dbPut', { data }),

      remove: (doc) => ipcSendSync('dbRemove', { doc }),
      bulkDocs: (docs) => ipcSendSync('dbBulkDocs', { docs }),
      allDocs: (key) => ipcSendSync('dbAllDocs', { key }),
      postAttachment: (docId, attachment, type) =>
        ipcSendSync('dbPostAttachment', { docId, attachment, type }),
      getAttachment: (docId) => ipcSendSync('dbGetAttachment', { docId }),
      getAttachmentType: (docId) => ipcSendSync('dbGetAttachmentType', { docId })
    })
  }

  // 事件
  onPluginEnter(cb: any): void {
    if (typeof cb !== 'function') {
      throw new TypeError('Callback must be a function')
    }
    this.hooks.onPluginEnter = cb
  }
  onPluginReady(cb: any): void {
    if (typeof cb !== 'function') {
      throw new TypeError('Callback must be a function')
    }
    this.hooks.onPluginReady = cb
  }
  onPluginOut(cb: any): void {
    if (typeof cb !== 'function') {
      throw new TypeError('Callback must be a function')
    }
    this.hooks.onPluginOut = cb
  }
  openPlugin(plugin: string): void {
    ipcSend('loadPlugin', plugin)
  }
  // 窗口交互
  hideMainWindow() {
    ipcSendSync('hideMainWindow')
  }
  showMainWindow() {
    ipcSendSync('showMainWindow')
  }
  showOpenDialog(options) {
    return ipcSendSync('showOpenDialog', options)
  }
  showSaveDialog(options) {
    return ipcSendSync('showSaveDialog', options)
  }
  setExpendHeight(height) {
    ipcSendSync('setExpendHeight', height)
  }
  setSubChange(onChange, placeholder = '', isFocus) {
    if (typeof onChange !== 'function') {
      throw new TypeError('Callback must be a function')
    }
    this.hooks.onSubInputChange = onChange
    ipcSendSync('setSubInput', {
      placeholder,
      isFocus
    })
  }

  removeSubInput() {
    delete this.hooks.onSubInputChange
    ipcSendSync('removeSubInput')
  }

  subInputBlur() {
    ipcSendSync('subInputBlur')
  }
  setSubInputValue(text) {
    ipcSendSync('setSubInputValue', text)
  }

  getPath(name: string) {
    return ipcSendSync('getPath', { name })
  }
  showNotification(body, clickFeatureCode) {
    ipcSend('showNotification', { body, clickFeatureCode })
  }
  copyImage(img) {
    ipcSendSync('copyImage', { img })
  }
  copyText(text) {
    return ipcSendSync('copyText', { text })
  }
  copyFile(file) {
    return ipcSendSync('copyFile', { file })
  }

  /**
   * @desc 用于打开一个外部链接
   * @param url
   */
  openExternal(url) {
    shell.openExternal(url)
  }
  /**
   * @desc 可以打开本地文件或目录
   * @param path
   */
  shellOpenPath(path) {
    shell.openPath(path)
  }
  isMacOs() {
    return os.type() === 'Darwin'
  }

  isWindows() {
    return os.type() === 'Windows_NT'
  }

  isLinux() {
    return os.type() === 'Linux'
  }

  getLocalId() {
    return ipcSendSync('getLocalId')
  }
}

const getExposedTools = () => {
  const toolsInstance = new Tools()
  const exposedTools: Record<string, any> = {}

  // 遍历 Tools 类的所有方法（除 constructor）并绑定 this
  Object.getOwnPropertyNames(Tools.prototype).forEach((key) => {
    if (key !== 'constructor' && typeof toolsInstance[key] === 'function') {
      exposedTools[key] = toolsInstance[key].bind(toolsInstance)
    }
  })
  return { ...toolsInstance, ...exposedTools }
}
// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('app', app)
    contextBridge.exposeInMainWorld('tools', getExposedTools())
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.app = app
}
