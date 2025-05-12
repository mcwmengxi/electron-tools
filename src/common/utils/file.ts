import { app, net } from 'electron'
import fs from 'fs'
import path from 'path'

// 添加在类外部作为工具函数
export async function downloadImageToTemp(url: string): Promise<string> {
  const tempPath = path.join(app.getPath('temp'), `notification-icon-${Date.now()}.png`)
  return new Promise((resolve, reject) => {
    const request = net.request(url)
    request.on('response', (response) => {
      const fileStream = fs.createWriteStream(tempPath)
      response?.pipe?.(fileStream)
      fileStream.on('finish', () => resolve(tempPath))
      fileStream.on('error', reject)
    })
    request.on('error', reject)
    request.end()
  })
}
