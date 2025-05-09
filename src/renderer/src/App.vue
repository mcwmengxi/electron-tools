<script setup lang="ts">
import TitleBar from './components/TitleBar.vue'
import Versions from './components/Versions.vue'
import Search from './components/Search.vue'
import Result from './components/Result.vue'
import useDrag from './utils/dragWindow'
import createPluginManager from './plugins-manager'
import { onMounted, ref, toRaw, watch } from 'vue'
import getWinHeight from '@common/utils/getWinHeight'
import { PLUGIN_HISTORY } from '@common/constants/renderer'
import { ElMessage } from 'element-plus'
import useLocalConfig from './composables/useLocalConfig'
const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

const { onMouseDown } = useDrag()

const {
  searchValue,
  setSearchValue,
  onSearch,
  initPlugins,
  openPlugin,
  getPluginInfo,
  options,
  pluginLoading,
  currentPlugin,
  pluginHistory,
  setPluginHistory,
  changePluginHistory
} = createPluginManager()
const clipboardFile = ref([])
const { config, getConfig } = useLocalConfig()
const menuPluginInfo = ref({})
const currentSelect = ref(0)
initPlugins()
onMounted(async () => {
  await getConfig()
  console.log(config.value, 'config')
})
getPluginInfo({
  pluginName: 'feature',
  pluginBaseKey: 'static',
  pluginPath: `feature/package.json`
  // __static 不可用
}).then((res) => {
  console.log('系统插件信息', res)

  menuPluginInfo.value = res
})

const changeIndex = (index) => {
  const len = options.value.length || pluginHistory.value.length
  if (!len) return
  if (currentSelect.value + index > len - 1) {
    currentSelect.value = 0
  } else if (currentSelect.value + index < 0) {
    currentSelect.value = len - 1
  } else {
    currentSelect.value = currentSelect.value + index
  }
}
const clearSearchValue = () => {
  setSearchValue('')
}

const choosePlugin = (plugin) => {
  if (options.value.length) {
    const currentChoose = options.value[currentSelect.value]
    currentChoose.click()
  } else {
    // todo
    const localPlugins = window.electron.ipcRenderer.sendSync('msg-trigger', {
      type: 'getLocalPlugins'
    })
    const currentChoose = pluginHistory.value[currentSelect.value]
    // 插件是否被卸载！
    let hasRemove = true

    if (currentChoose.pluginType === 'app') {
      hasRemove = false
      // changePluginHistory(currentChoose);
      // exec(currentChoose.action);
      return
    }
    localPlugins.find((plugin) => {
      if (plugin.name === currentChoose.originName) {
        hasRemove = false
        return true
      }
      return false
    })
    if (hasRemove) {
      // 更新历史记录
      const result = window.tools.db.get(PLUGIN_HISTORY) || {}
      const newHistory = result.data.filter((item) => item.originName !== currentChoose.originName)
      setPluginHistory(newHistory)
      return ElMessage.warning('插件已被卸载！')
    }
    changePluginHistory(currentChoose)
    window.tools.openPlugin(
      JSON.parse(
        JSON.stringify({
          ...currentChoose,
          ext: {
            code: currentChoose.feature.code,
            type: currentChoose.cmd.type || 'text',
            payload: null
          }
        })
      )
    )
  }
}
const openMenu = (ext: string | undefined) => {
  // todo 打开插件市场
  const sysyemPlugin = {
    ...toRaw(menuPluginInfo.value),
    feature: menuPluginInfo.value?.features[0],
    cmd: '插件市场',
    ext
  }
  console.log('openMenu', sysyemPlugin)
  openPlugin(sysyemPlugin)
  // window.electron.ipcRenderer.send('open-menu')
}

watch(
  [options, currentPlugin, pluginHistory],
  () => {
    currentSelect.value = 0
    if (currentPlugin.value.name) return
    const height = getWinHeight(
      options.value,
      pluginLoading.value || !config?.value?.perf?.common?.history ? [] : pluginHistory.value
    )
    console.log(pluginHistory, 'pluginHistory')
    window.tools?.setExpendHeight?.(height)
  },
  {
    immediate: true
  }
)
</script>

<template>
  <div id="components-layout" class="container" @mousedown="onMouseDown">
    <TitleBar />
    <Search
      :search-value="searchValue"
      :plugin-loading="pluginLoading"
      :current-plugin="currentPlugin"
      :plugin-history="pluginHistory"
      @change-current="changeIndex"
      @clear-search-value="clearSearchValue"
      @choose-plugin="choosePlugin"
      @open-menu="openMenu"
      @on-search="onSearch"
    />
    <Result
      :plugin-history="pluginHistory"
      :current-plugin="currentPlugin"
      :search-value="searchValue"
      :current-select="currentSelect"
      :options="options"
      :clipboard-file="clipboardFile || []"
      @set-plugin-history="setPluginHistory"
      @choose-plugin="choosePlugin"
    />

    <div class="actions">
      <div class="action">
        <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">Documentation</a>
      </div>
      <div class="action">
        <a target="_blank" rel="noreferrer" @click="ipcHandle">Send IPC</a>
      </div>
    </div>
    <Versions />
  </div>
</template>
