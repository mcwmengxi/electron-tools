# electron-tools

An Electron application with Vue and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

## Project Setup

### Install

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```

### 查看数据库

```bash
npx pouchdb-server --port 5984
```

### CSP

```javascript
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data: app://; script-src 'self'; style-src 'self' 'unsafe-inline';">

// 在 Electron 主进程中设置 CSP 如果在主进程中设置了 CSP，也需要更新
mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': ["default-src 'self'; img-src 'self' data: app://; script-src 'self'; style-src 'self' 'unsafe-inline';"]
    }
  })
})
```
