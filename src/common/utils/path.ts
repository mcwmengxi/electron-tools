import { app } from 'electron'
import path from 'node:path'

/**
 *
 * @param pathDir 静态资源目录
 * @returns 静态资源目录路径
 */
export function getStaticPath(pathDir: string = 'resources') {
  const staticPath = path.join(app.getAppPath(), pathDir)
  return staticPath
}
