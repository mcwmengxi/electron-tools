import path from 'node:path'
import { PLUGIN_INSTALL_DIR as baseDir } from '../../common/constants/main'
import envHelper from '../../common/utils/envHelper'
import { PluginHandler } from '../../core'
import API from '../common/api'

export default () => {
  let pluginInstance
  let registry

  // 初始化插件
  const init = async () => {
    try {
      const res = await API.dbGet({
        data: {
          id: 'tools-localhost-config'
        }
      })
      registry = res && res.data.register

      pluginInstance = await new PluginHandler({
        registry,
        baseDir
      })
    } catch (error) {
      console.log('pluginInstance init error', error)
      pluginInstance = await new PluginHandler({
        registry,
        baseDir
      })
    }
  }
  const getPluginInstance = async () => {
    if (!pluginInstance) {
      await init()
    }
    return pluginInstance
  }
  const getPluginInfo = async ({ pluginName, pluginPath }) => {
    const pluginInst = await getPluginInstance()
    const pluginInfo = await pluginInst.getAdapterInfo(pluginName, pluginPath)
    return {
      ...pluginInfo,
      icon: pluginInfo.logo,
      indexPath: envHelper.dev()
        ? 'http://localhost:8081/#/'
        : `file://${path.join(pluginPath, '../', pluginInfo.main)}`
    }
  }
  return {
    init,
    getPluginInfo
  }
}
