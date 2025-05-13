import path from 'node:path'
import fs from 'fs-extra'
import PouchDB from 'pouchdb'
import { DBError, Doc, DocRes } from './types'

export default class DB {
  readonly docMaxByteLength
  readonly docAttachmentMaxByteLength
  public dbName
  public dbPath
  public pouchDB: any
  constructor(dbPath: string) {
    this.docMaxByteLength = 2 * 1024 * 1024 // 2M
    this.docAttachmentMaxByteLength = 20 * 1024 * 1024 // 20M
    this.dbPath = dbPath
    this.dbName = path.join(dbPath, 'default')
  }

  init(): void {
    fs.existsSync(this.dbPath) || fs.mkdirSync(this.dbPath)
    this.pouchDB = new PouchDB(this.dbName, { auto_compaction: true })
  }

  getDocId(name: string, id: string): string {
    return name + '/' + id
  }

  replaceDocId(name: string, id: string): string {
    return id.replace(name + '/', '')
  }
  errorInfo(name: string, message: string): DBError {
    return { error: true, name, message }
  }

  private checkDocSize(doc: Doc<any>) {
    if (Buffer.byteLength(JSON.stringify(doc)) > this.docMaxByteLength) {
      return this.errorInfo(
        'docMaxByteLength exception',
        `doc max size ${this.docMaxByteLength / 1024 / 1024} M`
      )
    }
    return false
  }

  async put(name: string, doc: Doc<any>, strict = true): Promise<DBError | DocRes> {
    if (strict) {
      const err = this.checkDocSize(doc)
      if (err) return err
    }
    doc._id = this.getDocId(name, doc._id)

    try {
      const result = await this.pouchDB.put(doc)
      doc._id = result.id = this.replaceDocId(name, result.id)
      return result
    } catch (e: any) {
      doc._id = this.replaceDocId(name, doc._id)
      return { id: doc._id, name: e.name, error: !0, message: e.message }
    }
  }
  async get(name: string, id: string): Promise<DocRes | null> {
    try {
      const result: DocRes = await this.pouchDB.get(this.getDocId(name, id))
      result._id = this.replaceDocId(name, result._id)
      return result
    } catch (e) {
      console.log(e)
      return null
    }
  }

  /**
   * @desc 删除
   * @param name
   * @param doc
   * @returns
   */
  async remove(name: string, doc: Doc<any> | string) {
    try {
      let target
      if (typeof doc === 'object') {
        target = doc
        if (!target._id || typeof target._id !== 'string') {
          return this.errorInfo('exception', 'doc _id error')
        }
        target._id = this.getDocId(name, target._id)
      } else {
        if (typeof doc !== 'string') {
          return this.errorInfo('exception', 'param error')
        }
        target = await this.pouchDB.get(this.getDocId(name, doc))
      }
      const result: DocRes = await this.pouchDB.remove(target)

      target._id = result._id = this.replaceDocId(name, target._id)
      return result
    } catch (error: any) {
      if ('object' === typeof doc) {
        doc._id = this.replaceDocId(name, doc._id)
      }
      return this.errorInfo(error.name, error.message)
    }
  }
}
