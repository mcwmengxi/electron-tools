const LOCAL_CONFIG_KEY = 'tools-local-config'

const localConfig = {
  getConfig: () => {
    const { data } = window.tools.db.get(LOCAL_CONFIG_KEY) || {}
    return data
  },
  set: (data: any) => {
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
}

export default localConfig
