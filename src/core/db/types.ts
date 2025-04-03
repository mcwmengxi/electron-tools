type RevisionId = string

// todo 附件和索引
export interface Doc<T = Record<string, any>> {
  _id: string
  data: T
  _rev?: RevisionId
  _attachments?: any
}
export interface DocRes {
  id: string
  ok: boolean
  rev: RevisionId
  _id: string
  data?: any
}

export interface DBError {
  /**
   * HTTP Status Code during HTTP or HTTP-like operations
   */
  status?: number | undefined
  name?: string | undefined
  message?: string | undefined
  reason?: string | undefined
  error?: string | boolean | undefined
  id?: string | undefined
  rev?: RevisionId | undefined
}
