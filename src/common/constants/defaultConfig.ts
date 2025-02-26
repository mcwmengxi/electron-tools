import path from 'node:path'

const staticPath = path.join(__dirname, '../../public') // 假设静态资源在 public 文件夹中
console.log(staticPath)

export default {
  version: 7,
  perf: {
    custom: {
      theme: 'SPRING',
      primaryColor: '#ff4ea4',
      errorColor: '#ed6d46',
      warningColor: '#e5a84b',
      successColor: '#c0d695',
      infoColor: '#aa8eeB',
      logo: `file://${staticPath}/logo.png`,
      placeholder: '你好，Rubick！请输入插件关键词',
      username: 'Tools'
    },
    shortCut: {
      showAndHidden: 'Option+R',
      separate: 'Ctrl+D',
      quit: 'Shift+Escape',
      capture: 'Ctrl+Shift+A'
    },
    common: {
      start: true,
      space: true,
      hideOnBlur: true,
      autoPast: false,
      darkMode: false,
      guide: false,
      history: true,
      lang: 'zh-CN'
    },
    local: {
      search: true
    }
  },
  global: []
}
