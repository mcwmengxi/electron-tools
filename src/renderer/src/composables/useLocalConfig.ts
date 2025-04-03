import { Ref, ref } from 'vue'

const LOCAL_CONFIG_KEY = 'tools-local-config'
export default function useLocalConfig() {
  const config = ref({}) as Ref<Recordable>

  const getConfig = async () => {
    const { data } = (await window.tools.db.get(LOCAL_CONFIG_KEY)) || {}
    config.value = data
  }
  const setConfig = async (data: any) => {
    const localConfig: any = (await window.tools.db.get(LOCAL_CONFIG_KEY)) || {}
    await window.tools.db.put({
      _id: LOCAL_CONFIG_KEY,
      _rev: localConfig._rev,
      data: {
        ...localConfig.data,
        ...data
      }
    })
  }

  return { config, getConfig, setConfig }
}
