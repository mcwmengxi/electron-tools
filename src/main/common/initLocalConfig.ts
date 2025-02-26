import defaultConfig from '../../common/constants/defaultConfig'
import DBInstance from './db'

const LOCAL_CONFIG_KEY = 'tools-local-config'

const db = new DBInstance()
const localConfig = {
  async init() {
    const localConfig: any = await db.dbGet({ data: { id: LOCAL_CONFIG_KEY } })
    if (!localConfig || !localConfig.data || localConfig.data.version !== defaultConfig.version) {
      const data: any = {
        _id: LOCAL_CONFIG_KEY,
        data: defaultConfig
      }
      if (localConfig && localConfig) {
        data._rev = localConfig._rev
      }
      // 初始化到数据库
      await db.dbPut({ data: { data } })
    }
  },
  async getConfig(): Promise<any> {
    const data: any = (await db.dbGet({ data: { id: LOCAL_CONFIG_KEY } })) || {}
    return data.data
  },
  async setConfig(data: any) {
    const localConfig: any = (await db.dbGet({ data: { id: LOCAL_CONFIG_KEY } })) || {}
    await db.dbPut({
      data: {
        data: {
          _id: LOCAL_CONFIG_KEY,
          _rev: localConfig._rev,
          data: {
            ...localConfig.data,
            ...data
          }
        }
      }
    })
  }
}

export default localConfig
