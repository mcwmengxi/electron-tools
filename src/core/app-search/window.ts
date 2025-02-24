import path from 'node:path'
import os from 'node:os'
import fsp from 'node:fs/promises'
import fs from 'node:fs'
import extractFileIcon from 'extract-file-icon'
import { shell, ShortcutDetails } from 'electron'
// 系统快捷方式 C:\ProgramData\Microsoft\Windows\Start Menu\Programs
const SYSYTEM_SHORTCUT = path.resolve('C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs')
// Windows 附件 C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Accessories
const ORIGIN_SHORTCUT = path.resolve(
  'C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\Accessories'
)

// app 列表
const appList: unknown[] = []
// example: C:\Users\mengxi\AppData\Roaming
const appData = path.resolve(os.homedir(), './AppData/Roaming')
// 用户快捷方式 example: C:\Users\QSKJ\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Accessibility
const USER_SHORTCUT = path.resolve(appData, './Microsoft/Windows/Start Menu/Programs')
/**
 * 中文正则表达式，用于检测字符串中是否包含中文字符
 * Unicode范围[\u4e00-\u9fa5]对应中文字符集
 */
const isZhRegex = /[\u4e00-\u9fa5]/

const icondir = path.join(os.tmpdir(), 'ProcessIcon')
const exists = fs.existsSync(icondir)
if (!exists) {
  fs.mkdirSync(icondir)
}

const getico = (app) => {
  try {
    const buffer = extractFileIcon(app.desc, 32)
    const iconpath = path.join(icondir, `${app.name}.png`)

    fs.access(iconpath, (exists) => {
      if (!exists) {
        fs.writeFile(iconpath, buffer, 'base64', () => {})
      }
    })
  } catch (e) {
    console.log(e, app.desc)
  }
}

async function fileDisplay(filePath) {
  // 1.根据文件路径读取文件，返回文件列表
  try {
    const files = await fsp.readdir(filePath)
    // 遍历读取到的文件列表
    for (const filename of files) {
      // 获取当前文件的绝对路径
      const abs = path.resolve(filePath, filename)
      // 获取当前文件的状态信息
      try {
        const stat = await fsp.stat(abs)
        // 判断当前文件是否为文件夹
        if (stat.isDirectory()) {
          // 如果是文件夹，则递归继续遍历该文件夹下面的文件
          fileDisplay(abs)
        }
        if (abs.indexOf('.ini') > -1) return
        if (stat.isFile()) {
          // 找到 appName
          const appName = filename.split('.')[0]
          const keyWords = [appName]
          let appDetail: ShortcutDetails = {}
          try {
            // 通过 shell.readShortcutLink 获取 快捷方式 信息
            appDetail = await shell.readShortcutLink(abs)
          } catch (error) {
            console.warn('解析shortcutPath中的快捷链接失败', abs, error?.toString())
          }
          // 如果获取不到简介信息或卸载的快捷方式，则丢弃
          if (!appDetail.target || appDetail.target.toLowerCase().indexOf('unin') >= 0) return

          // C:/program/cmd.exe => cmd
          keyWords.push(path.basename(appDetail.target, '.exe'))

          if (isZhRegex.test(appName)) {
            // todo 中文
          } else {
            const firstLatter = appName
              .split(' ')
              .map((name) => name[0])
              .join('')
            keyWords.push(firstLatter)
          }
          // C:\Users\QSKJ\AppData\Local\Temp
          const icon = path.join(os.tmpdir(), 'ProcessIcon', `${encodeURIComponent(appName)}.png`)
          const appInfo = {
            value: 'plugin',
            desc: appDetail.target,
            icon,
            keyWords,
            pluginType: 'app',
            action: `start "dummyclient" "${appDetail.target}"`,
            type: 'app',
            name: appName,
            names: JSON.parse(JSON.stringify(keyWords))
          }
          appList.push(appInfo)
          getico(appInfo)
        }
      } catch (eror) {
        console.warn('获取文件stats失败', eror?.toString())
      }
    }
  } catch (err) {
    console.warn(err)
  }
}

export default async () => {
  const shortcuts = [SYSYTEM_SHORTCUT, ORIGIN_SHORTCUT, USER_SHORTCUT]
  await Promise.all(shortcuts.map((appPath) => fileDisplay(appPath)))
  return { appList }
}
