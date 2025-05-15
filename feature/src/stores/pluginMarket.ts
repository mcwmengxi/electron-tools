import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePluginMarketStore = defineStore('pluginMarket', () => {
  const active = ref(['finder'])
  const searchValue = ref('')
  const setSearchValue = (payload: string) => {
    searchValue.value = payload
  }
  const commonUpdate = (payload: Record<string, any> = {}) => {
    Object.keys(payload).forEach((key) => {
      if (key in this) {
        this[key].value = payload[key]
      }
    })
  }
  return {
    active,
    searchValue,
    setSearchValue,
    commonUpdate
  }
})
