import fs from 'fs-extra'
import got from 'got'
/**
 * 系统插件管理器
 * @class AdapterHandler
 */

import { ipcRenderer } from 'electron'
import { AdapterHandlerOptions, AdapterInfo } from './types'
import { spawn } from 'node:child_process'
import path from 'node:path'
import axios from 'axios'
import api from '../../main/common/api'

class AdapterHandler {
  // 插件安装地址
  public baseDir: string
  // 插件源地址
  private registry: string

  pluginCaches = {}

  constructor(options: AdapterHandlerOptions) {
    if (!fs.existsSync(options.baseDir)) {
      fs.mkdirSync(options.baseDir)
      fs.writeFileSync(options.baseDir + '/package.json', '{"dependencies":{}}')
    }
    this.baseDir = options.baseDir

    this.registry = options.registry || 'https://registry.npmmirror.com'
    // 初始化注册表配置
    this.initRegistry()
  }

  private initRegistry(): void {
    api
      .dbGet({
        data: {
          id: 'tools-localhost-config'
        }
      })
      .then((dbData) => {
        if (dbData?.data?.register) {
          this.registry = dbData.data.register
        }
      })
      .catch((error) => {
        console.log('查询配置出错', error)
      })
  }
  // 运行包管理器命令
  private async execCommand(cmd: string, modules: string[]): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      let args: string[] = [cmd].concat(
        cmd !== 'uninstall' && cmd !== 'link' ? modules.map((m) => `${m}@latest`) : modules
      )
      if (cmd !== 'link') {
        args = args.concat('--color=always').concat('--save').concat(`--registry=${this.registry}`)
      }

      const npm = spawn('npm', args, { cwd: this.baseDir })

      console.log(args)
      let output = ''
      npm.stdout
        .on('data', (data) => {
          output += data // 获取输出日志
        })
        .pipe(process.stdout)
      npm.stderr
        .on('data', (data) => {
          output += data // 获取报错日志
        })
        .pipe(process.stderr)

      npm.on('close', (code) => {
        if (!code) {
          // 如果没有报错就输出正常日志
          resolve({ code: 0, data: output })
        } else {
          // 否则就输出报错日志
          reject({ code: code, data: output }) // 如果报错就输出报错日志
        }
      })
    })
  }

  // 安装并启动插件
  async install(adapters: Array<string>, options: { isDev: boolean }) {
    const installCmd = options.isDev ? 'link' : 'install'
    // 安装
    await this.execCommand(installCmd, adapters)
  }

  /**
   * 更新指定插件
   * @param {...string[]} adapters 插件名称
   * @memberof AdapterHandler
   */
  async update(...adapters: string[]) {
    await this.execCommand('update', adapters)
  }
  /**
   * 卸载指定插件
   * @param {...string[]} adapters 插件名称
   * @param options
   * @memberof AdapterHandler
   */
  async uninstall(adapters: string[], options: { isDev: boolean }) {
    const installCmd = options.isDev ? 'unlink' : 'uninstall'
    // 卸载插件
    await this.execCommand(installCmd, adapters)
  }

  /**
   * 列出所有已安装插件
   * @memberof AdapterHandler
   */
  async list() {
    const installInfo = JSON.parse(await fs.readFile(this.baseDir + '/package.json', 'utf-8'))
    const adapters: string[] = []
    for (const adapter in installInfo.dependencies) {
      adapters.push(adapter)
    }
    return adapters
  }
  /**
   * 获取插件信息
   * @param {string} adapter 插件名称
   * @param {string} adapterPath 插件指定路径
   * @memberof PluginHandler
   */
  async getAdapterInfo(adapter: string, adapterPath?: string): Promise<AdapterInfo> {
    let adapterInfo: AdapterInfo
    const targetPath =
      adapterPath || path.resolve(this.baseDir, 'node_modules', adapter, 'plugin.json')
    if (await fs.pathExists(targetPath)) {
      adapterInfo = JSON.parse(fs.readFileSync(targetPath, 'utf-8')) as AdapterInfo
      return adapterInfo
    } else {
      // 本地没有从远程获取
      const resp = await got.get(`https://cdn.jsdelivr.net/npm/${adapter}/plugin.json`)
      // Todo 校验合法性
      adapterInfo = JSON.parse(resp.body) as AdapterInfo
    }
    return adapterInfo
  }

  async upgrade(name: string): Promise<void> {
    // 创建一个npm-registry-client实例
    const packageJSON = JSON.parse(fs.readFileSync(`${this.baseDir}/package.json`, 'utf-8'))
    const registryUrl = `https://registry.npmmirror.com/${name}`
    try {
      const installedVersion = packageJSON.dependencies[name].replace('^', '')
      let latestVersion = this.pluginCaches[name]
      if (!latestVersion) {
        const { data } = await axios.get(registryUrl, { timeout: 2000 })
        latestVersion = data['dist-tags'].latest
      }
      if (latestVersion > installedVersion) {
        await this.install([name], { isDev: false })
      }
    } catch (e) {
      console.log(e)
    }
  }
}

export default AdapterHandler
