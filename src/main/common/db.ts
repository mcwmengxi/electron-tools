import { app } from 'electron'
import { LocalDb } from '../../core'

const dbInstance = new LocalDb(app.getPath('userData'))
dbInstance.init()

export default class DBInstance {
  /**
   * 当前插件实例
   * @type {null | any}
   */
  public currentPlugin: null | any = null

  /**
   * 数据库默认键名 (插件信息)
   * @type {string}
   */
  private DBKEY = 'TOOLS_DB_DEFAULT'

  /**
   * 插件信息键名 (插件信息)
   * @type {string}
   */
  private DB_INFO_KET = 'TOOLS_PLUGIN_INFO'

  public async dbPut({ data }) {
    // 记录插件有哪些 dbkey，用于后续的数据同步
    if (this.currentPlugin && this.currentPlugin.name) {
      let dbInfo: any = await dbInstance.get(this.DBKEY, this.DB_INFO_KET)
      if (!dbInfo) {
        dbInfo = { data: [], _id: this.DB_INFO_KET }
      }
      const item = dbInfo.data.find((it) => it.name === this.currentPlugin.name)
      if (item) {
        !item.keys.includes(data.data._id) && item.keys.push(data.data._id)
      } else {
        dbInfo.data.push({
          name: this.currentPlugin.name,
          keys: [data.data._id]
        })
      }
      dbInstance.put(this.DBKEY, dbInfo)
    }
    try {
      await dbInstance.put(this.DBKEY, data.data)
    } catch (error) {
      console.log(error)
    }
    return
  }
  public dbGet({ data }) {
    return dbInstance.get(this.DBKEY, data.id)
  }

  public dbRemove({ data }) {
    return dbInstance.remove(this.DBKEY, data.doc)
  }
}
