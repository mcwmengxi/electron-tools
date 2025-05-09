import { reactive, ref, toRefs } from 'vue'
import searchManager from './search'
// const PLUGIN_HISTORY = 'tools-local-start-app';
import { PLUGIN_HISTORY } from '@common/constants/renderer'
import optionsManager from './options'

// 定义插件类型
type PluginType = {
  name: string
  path: string
  // 根据实际数据补充其他字段（如 version、description 等）
  [key: string]: any
}
// 定义历史记录插件类型
type HistoryPluginType = PluginType & {
  pin: boolean
}

// 定义状态类型
interface PluginManagerState {
  appList: PluginType[]
  plugins: PluginType[]
  localPlugins: PluginType[]
  currentPlugin: PluginType | object
  pluginLoading: boolean
  pluginHistory: HistoryPluginType[]
}
const createPluginManager = () => {
  const state: PluginManagerState = reactive({
    appList: [],
    plugins: [],
    localPlugins: [],
    currentPlugin: {},
    pluginLoading: false,
    pluginHistory: []
  })
  const appList = ref<Recordable>([])
  const { searchValue, placeholder, onSearch, setSearchValue, setSubInput } = searchManager()

  const currentPlugin = toRefs(state).currentPlugin
  const { options } = optionsManager(searchValue, appList, openPlugin, currentPlugin)

  window.electron.ipcRenderer.sendSync('msg-trigger', {
    type: 'initPluginInstance'
  })
  const initPluginHistory = () => {
    const result = window.tools.db.get(PLUGIN_HISTORY) || {}
    if (result && result.data) {
      state.pluginHistory = result.data as HistoryPluginType[]
    }
  }
  const initLocalStartPlugin = () => {
    const result = window.electron.ipcRenderer.sendSync('msg-trigger', {
      type: 'dbGet',
      data: { id: PLUGIN_HISTORY }
    })
    if (result && result.value) {
      appList.value.push(...result.value)
    }
  }
  // 初始化插件
  const initPlugins = async () => {
    // 初始化插件历史记录
    initPluginHistory()
    // 获取插件列表
    appList.value = await window.electron.ipcRenderer.sendSync('msg-trigger', {
      type: 'getPlugins'
    })

    initLocalStartPlugin()
  }

  const getPluginInfo = async ({ pluginName, pluginPath, pluginBaseKey }) => {
    const pluginInfo = await window.electron.ipcRenderer.sendSync('msg-trigger', {
      type: 'getPluginInfo',
      data: {
        pluginName,
        pluginPath,
        pluginBaseKey
      }
    })
    return pluginInfo
  }

  const initSystemPlugin = async () => {
    state.currentPlugin = {}
    setSearchValue('')
    setSubInput({ placeholder: '' })
  }
  async function loadPlugin(plugin) {
    console.log('loadPlugin', plugin)
  }
  async function openPlugin(plugin, option) {
    window.electron.ipcRenderer.send('msg-trigger', {
      type: 'removePlugin'
    })
    initSystemPlugin()
    if (['ui', 'system'].includes(plugin.pluginType)) {
      await loadPlugin(plugin)
    }
    window.electron.ipcRenderer.send('msg-trigger', {
      type: 'openPlugin',
      data: {
        plugin,
        option
      }
    })
  }

  const setPluginHistory = async (plugins) => {
    state.pluginHistory = plugins
    const unpin = state.pluginHistory.filter((plugin) => !plugin.pin)
    const pin = state.pluginHistory.filter((plugin) => plugin.pin)
    state.pluginHistory = [...pin, ...unpin]
    const result = (await window.tools.db.get(PLUGIN_HISTORY)) || {}
    await window.tools.db.put({
      _id: PLUGIN_HISTORY,
      _rev: result._rev,
      data: JSON.parse(JSON.stringify(state.pluginHistory))
    })
  }

  const changePluginHistory = async (plugin) => {
    const unpin = state.pluginHistory.filter((plugin) => !plugin.pin)
    const pin = state.pluginHistory.filter((plugin) => plugin.pin)
    const isPin = state.pluginHistory.find((p) => p.name === plugin.name)?.pin
    if (isPin) {
      pin.forEach((p, index) => {
        if (p.name === plugin.name) {
          plugin = pin.splice(index, 1)[0]
        }
      })
      pin.unshift(plugin)
    } else {
      unpin.forEach((p, index) => {
        if (p.name === plugin.name) {
          unpin.splice(index, 1)
        }
      })
      unpin.unshift(plugin)
    }

    if (state.pluginHistory.length > 8) {
      unpin.pop()
    }
    state.pluginHistory = [...pin, ...unpin]
    const result = (await window.tools.db.get(PLUGIN_HISTORY)) || {}
    await window.tools.db.put({
      _id: PLUGIN_HISTORY,
      _rev: result._rev,
      data: JSON.parse(JSON.stringify(state.pluginHistory))
    })
  }

  return {
    ...toRefs(state),
    searchValue,
    placeholder,
    options,
    onSearch,
    setSearchValue,
    initPlugins,
    openPlugin,
    getPluginInfo,
    setPluginHistory,
    changePluginHistory
  }
}

export default createPluginManager
