import path from 'node:path'
import fs from 'fs-extra'
// 插件通过 npm 安装下载后保存的路径
import { PLUGIN_INSTALL_DIR } from '../../common/constants/main'

const registerSystemPlugin = () => {
  // 读取所有插件
  const totalPlugins = global.LOCAL_PLUGINS.getLocalPlugins()
  // 通过 pluginType 从所有插件 totalPlugins 中过滤出系统插件
  let systemPlugins = totalPlugins.filter((plugin) => plugin.pluginType === 'system')
  // 处理插件的 entry 路径，由相对路径转为绝对路径
  systemPlugins = systemPlugins
    .map((plugin) => {
      try {
        const pluginPath = path.resolve(PLUGIN_INSTALL_DIR, 'node_modules', plugin.name)
        return {
          ...plugin,
          indexPath: path.join(pluginPath, './', plugin.entry)
        }
      } catch (e) {
        console.log(e)
        return false
      }
    })
    .filter(Boolean)
  // 定义插件的所有钩子函数
  type HookLifecycle = 'onReady'
  const hooks: Record<HookLifecycle, unknown[]> = { onReady: [] }
  // 收集所有系统插件的 onReady 钩子函数
  systemPlugins.forEach(async (plugin) => {
    if (fs.existsSync(plugin.indexPath)) {
      const pluginModule = await import(plugin.indexPath)
      hooks.onReady.push(pluginModule.onReady)
    }
  })
  // 定义触发所有插件的 onReady 钩子
  const triggerReadyHooks = (ctx) => {
    hooks.onReady.forEach((hook: unknown) => {
      try {
        hook && (hook as (ctx: unknown) => void)(ctx)
      } catch (e) {
        console.log(e)
      }
    })
  }
  return {
    triggerReadyHooks
  }
}

export default registerSystemPlugin
