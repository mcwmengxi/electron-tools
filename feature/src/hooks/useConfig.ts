const LOCAL_CONFIG_KEY = 'rubick-local-config'
const useConfig = () => {
  const getConfig = () => {
    const { data } = window.tools.db.get(LOCAL_CONFIG_KEY) || {}
    return data
  }
  const setConfig = (data: any) => {
    const localConfig: any = window.tools.db.get(LOCAL_CONFIG_KEY) || {}
    window.tools.db.put({
      _id: LOCAL_CONFIG_KEY,
      _rev: localConfig._rev,
      data: {
        ...localConfig.data,
        ...data
      }
    })
  }
  return {
    getConfig,
    setConfig
  }
}

export default useConfig
