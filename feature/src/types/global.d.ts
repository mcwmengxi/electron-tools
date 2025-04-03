declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      GET_LOCAL_PLUGINS: () => Recordable[]
    }
    tools: {
      // 事件监听
      onPluginEnter(cb: (...args: any[]) => void): void
      onPluginReady(cb: (...args: any[]) => void): void
      onPluginOut(cb: (...args: any[]) => void): void

      // 插件操作
      openPlugin(plugin: string): void

      // 窗口交互
      hideMainWindow(): void
      showMainWindow(): void
      showOpenDialog(options: Record<string, any>): unknown
      showSaveDialog(options: Record<string, any>): unknown
      setExpendHeight(height: number): void
      setSubChange(
        onChange: (event: any, ...args: any[]) => void,
        placeholder?: string,
        isFocus: boolean
      ): void
      removeSubInput(): void
      subInputBlur(): void
      setSubInputValue(text: string): void

      // 系统路径与信息
      getPath(name: string): string
      getLocalId(): string

      // 通知与复制
      showNotification(body: string, clickFeatureCode: string | number): void
      copyImage(img: string): void
      copyText(text: string): string
      copyFile(file: string): string

      // 系统交互
      openExternal(url: string): void
      shellOpenPath(path: string): void

      // 系统检测
      isMacOs(): boolean
      isWindows(): boolean
      isLinux(): boolean

      // 数据库操作
      db: {
        get: (id: string | number) => Doc
        put: (data: Record<string, any>) => unknown
        remove: (doc: Record<string, any>) => unknown
        bulkDocs: (docs: Record<string, any>[]) => unknown
        allDocs: (key?: string) => Record<string, any>[]
        postAttachment: (docId: string, attachment: Blob | File, type: string) => unknown
        getAttachment: (docId: string) => unknown
        getAttachmentType: (docId: string) => string | null
      }
    }
    platform: string
  }
}
export {}
