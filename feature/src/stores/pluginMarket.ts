import request from '@/services/request'
import { defineStore } from 'pinia'

type Plugin = { name: string; isloading: boolean; isdownload?: boolean }
export interface PluginMarketState {
  active: string[]
  searchValue: string
  localPlugins: Plugin[]
  totalPlugins: Plugin[]
}
// 提取key
type PluginMarketKey = keyof Partial<PluginMarketState>

export const usePluginMarketStore = defineStore('pluginMarket', {
  state: (): PluginMarketState => ({
    localPlugins: [],
    totalPlugins: [],
    active: ['finder'],
    searchValue: ''
  }),
  actions: {
    setSearchValue(payload: string) {
      this.searchValue = payload
    },
    commonUpdate(payload: Partial<PluginMarketState>) {
      ;(Object.keys(payload) as PluginMarketKey[]).forEach((key) => {
        if (key in this) {
          this[key] = payload[key] as never
        }
      })
    },
    async init() {
      // 插件市场
      window.electron.ipcRenderer.send('msg-trigger', { type: 'getTotalPlugins' })
      const totalPlugins = await request.getTotalPlugins()
      // 本地插件
      const localPlugins = window.api.GET_LOCAL_PLUGINS()

      // 修复卸载失败，一直转圈的问题。
      localPlugins.forEach((origin: Plugin) => {
        origin.isloading = false
      })
      this.commonUpdate({
        localPlugins,
        totalPlugins
      })
    }
  }
})
