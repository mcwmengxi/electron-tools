import { contextBridge, ipcRenderer, shell } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import os from 'node:os'

const ipcSendSync = (type, data) => {
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

const market = {
  getLocalPlugins() {
    // return remote.getGlobal('LOCAL_PLUGINS').getLocalPlugins();
    return global.LOCAL_PLUGINS
  },
  downloadPlugin(plugin) {
    // return remote.getGlobal('LOCAL_PLUGINS').downloadPlugin(plugin);
    return global.downloadPlugin(plugin);
  },
  deletePlugin(plugin) {
    // return remote.getGlobal('LOCAL_PLUGINS').deletePlugin(plugin);
    return global.deletePlugin(plugin);
  },
  refreshPlugin(plugin) {
    // return remote.getGlobal('LOCAL_PLUGINS').refreshPlugin(plugin);
    return global.refreshPlugin(plugin);
  },
  addLocalStartPlugin(plugin) {
    ipcSend('addLocalStartPlugin', { plugin });
  },
  removeLocalStartPlugin(plugin) {
    ipcSend('removeLocalStartPlugin', { plugin });
  },
  dbDump: (target) => {
    ipcSend('dbDump', { target })
  },

  dbImport: (target) => {
    ipcSend('dbImport', { target })
  }
}
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('market', market)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.market = market
}
