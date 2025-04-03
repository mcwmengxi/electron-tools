import fs from 'fs-extra'
import path from 'node:path'
import { PLUGIN_INSTALL_DIR as baseDir } from '../constants/main'
import api from '../../main/common/api'
import { PluginHandler } from '../../core'

const configPath = path.join(baseDir, './tools-local-plugin.json')

let registry
let pluginInstance
;(async () => {
  try {
    const res = await api.dbGet({
      data: {
        id: 'tools-localhost-config'
      }
    })
    registry = res && res.data.register
    pluginInstance = new PluginHandler({
      baseDir,
      registry
    })
  } catch (e) {
    console.log(e)

    pluginInstance = new PluginHandler({
      baseDir,
      registry
    })
  }
})()
global.LOCAL_PLUGINS = {
  PLUGINS: [],
  async downloadPlugin(plugin) {
    await pluginInstance.install([plugin.name], { isDev: plugin.isDev })
    if (plugin.isDev) {
      // 获取 dev 插件信息
      const pluginPath = path.resolve(baseDir, 'node_modules', plugin.name)
      const pluginInfo = JSON.parse(
        fs.readFileSync(path.join(pluginPath, './package.json'), 'utf8')
      )
      plugin = {
        ...plugin,
        ...pluginInfo
      }
    }
    global.LOCAL_PLUGINS.addPlugin(plugin)
    return global.LOCAL_PLUGINS.PLUGINS
  },
  refreshPlugin(plugin) {
    // 获取 dev 插件信息
    const pluginPath = path.resolve(baseDir, 'node_modules', plugin.name)
    const pluginInfo = JSON.parse(fs.readFileSync(path.join(pluginPath, './package.json'), 'utf8'))
    plugin = {
      ...plugin,
      ...pluginInfo
    }
    // 刷新
    let currentPlugins = global.LOCAL_PLUGINS.getLocalPlugins()
    currentPlugins = currentPlugins.map((p) => {
      if (p.name === plugin.name) {
        return plugin
      }
      return p
    })
    // 存入
    global.LOCAL_PLUGINS.PLUGINS = currentPlugins
    fs.writeFileSync(configPath, JSON.stringify(currentPlugins))
    return global.LOCAL_PLUGINS.PLUGINS
  },
  getLocalPlugins() {
    try {
      if (!global.LOCAL_PLUGINS.PLUGINS.length) {
        global.LOCAL_PLUGINS.PLUGINS = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        return global.LOCAL_PLUGINS.PLUGINS
      }
    } catch {
      // console.log(e)

      global.LOCAL_PLUGINS.PLUGINS = []
      return global.LOCAL_PLUGINS.PLUGINS
    }
  },

  addPlugin(plugin) {
    const currentPlugins = global.LOCAL_PLUGINS.getLocalPlugins() || []
    let isExist = false
    currentPlugins.some((p) => (isExist = p.name === plugin.name))
    if (!isExist) {
      currentPlugins.unshift(plugin)
      // 确保目录存在
      // const dir = path.dirname(configPath)
      // if (!fs.existsSync(dir)) {
      //   fs.mkdirSync(dir, { recursive: true })
      // }

      fs.writeFileSync(configPath, JSON.stringify(currentPlugins))
    }
  },

  // 更新
  updatePlugin(plugin) {
    global.LOCAL_PLUGINS.PLUGINS = global.LOCAL_PLUGINS.PLUGINS.map((origin) => {
      if (origin.name === plugin.name) {
        return plugin
      }
      return origin
    })

    fs.writeFileSync(configPath, JSON.stringify(global.LOCAL_PLUGINS.PLUGINS))
  },

  async deletePlugin(plugin) {
    await pluginInstance.install([plugin.name], { isDev: plugin.isDev })
    global.LOCAL_PLUGINS.PLUGINS = global.LOCAL_PLUGINS.PLUGINS.filter(
      (origin) => origin.name !== plugin.name
    )
    fs.writeFileSync(configPath, JSON.stringify(global.LOCAL_PLUGINS.PLUGINS))

    return global.LOCAL_PLUGINS.PLUGINS
  }
}
