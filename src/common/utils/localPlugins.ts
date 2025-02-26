import fs from 'fs-extra'
import path from 'node:path'
import { PLUGIN_INSTALL_DIR as baseDir } from '../constants/main'

const configPath = path.join(baseDir, './tools-local-plugin.json')

global.LOCAL_PLUGINS = {
  PLUGINS: [],
  getLocalPlugins() {
    try {
      if (!global.LOCAL_PLUGINS.PLUGINS.length) {
        global.LOCAL_PLUGINS.PLUGINS = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        return global.LOCAL_PLUGINS.PLUGINS
      }
    } catch (e) {
      // console.log(e)

      global.LOCAL_PLUGINS.PLUGINS = []
      return global.LOCAL_PLUGINS.PLUGINS
    }
  }
}
