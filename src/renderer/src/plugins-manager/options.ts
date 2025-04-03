import { ref, watch } from 'vue'
import PinyinMatch from 'pinyin-match'
import { debounce } from 'lodash-es'

const optionsManager = (searchValue, appList, openPlugin, currentPlugin) => {
  const optionsRef = ref()

  function formatReg(regStr) {
    const flags = regStr.replace(/.*\/([gimy]*)$/, '$1')
    const pattern = regStr.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1')
    return new RegExp(pattern, flags)
  }
  function searchKeyValues(lists, value, strict = false) {
    return lists.filter((item) => {
      if (typeof item === 'string') {
        return !!PinyinMatch.match(item, value)
      }
      if (item.type === 'regex' && !strict) {
        return formatReg(item.match).test(value)
      }
      if (item.type === 'over' && !strict) {
        return true
      }
      return false
    })
  }

  // 搜索结果排序
  const getIndex = (cmd, value) => {
    let index = 0
    if (PinyinMatch.match(cmd.label || cmd, value)) {
      index += 1
    }
    if (cmd.label) {
      index -= 1
    }
    return index
  }

  const getOptionsFromSearchValue = (value, strict = false) => {
    // 先搜索插件
    const localPlugins = window.api.GET_LOCAL_PLUGINS()
    let options: any = []

    localPlugins.forEach((plugin: any) => {
      const feature = plugin.features
      // 系统插件无 features 的情况，不需要再搜索
      if (!feature) return
      feature.forEach((fe: any) => {
        const cmds = searchKeyValues(fe.cmds, value, strict)
        if (plugin.key === 'search') {
          options = plugin.options
          options = [
            ...options,
            ...cmds.map((cmd) => {
              const option = {
                name: cmd.label || cmd,
                value: 'plugin',
                icon: plugin.logo,
                desc: fe.explain,
                type: plugin.pluginType,
                match: PinyinMatch.match(cmd.label || cmd, value),
                zIndex: getIndex(cmd, value), // 排序权重
                click: () => {
                  pluginClickEvent({
                    plugin,
                    fe,
                    cmd,
                    ext: cmd.type
                      ? {
                          code: fe.code,
                          type: cmd.type || 'text',
                          payload: searchValue.value
                        }
                      : null,
                    openPlugin,
                    option
                  })
                }
              }
              return option
            })
          ]
        }
      })
    })

    // todo 再搜索 app
    const appPlugins = appList.value || []
    const descMap = new Map()
    options = [
      ...options,
      ...appPlugins
        .filter((plugin) => {
          if (!descMap.get(plugin)) {
            descMap.set(plugin, true)
            let has = false
            plugin.keyWords.some((keyWord) => {
              const match = PinyinMatch.match(keyWord, value)
              if (
                // keyWord
                //   .toLocaleUpperCase()
                //   .indexOf(value.toLocaleUpperCase()) >= 0 ||
                match
              ) {
                has = keyWord
                plugin.name = keyWord
                plugin.match = match
                return true
              }
              return false
            })
            return has
          } else {
            return false
          }
        })
        .map((plugin) => {
          const option = {
            ...plugin,
            zIndex: 0,
            click: () => {
              openPlugin(plugin, option)
            }
          }
          return option
        })
    ]
    return options
  }
  // 全局快捷键
  window.electron.ipcRenderer.on('global-short-key', (e, msg) => {
    const options = getOptionsFromSearchValue(msg, true)
    options[0].click()
  })

  const setOptionsRef = (options) => {
    optionsRef.value = options
  }

  const search = debounce((value) => {
    if (currentPlugin.value.name || clipboardFile.value.length) return

    if (!value) {
      optionsRef.value = []
      return
    }
    optionsRef.value = getOptionsFromSearchValue(value)
  }, 100)
  watch(searchValue, () => search(searchValue.value))

  return {
    options: optionsRef,
    setOptionsRef,
    openPlugin,
    currentPlugin
  }
}

export default optionsManager
