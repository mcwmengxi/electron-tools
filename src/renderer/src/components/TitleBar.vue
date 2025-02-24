<template>
  <div class="handle-bar">
    <div class="handle-info">
      <img :src="logo" alt="logo" width="24" height="24" />
      <span>rubick 系统菜单</span>
    </div>
    <div class="handle-container">
      <div class="handle">
        <div class="devtool" title="开发者工具" @click="openDevTool">
          <el-icon><Aim /></el-icon>
        </div>
      </div>
      <div v-if="platform !== 'darwin'" class="window-handle">
        <div class="minimize" @click="minimize">
          <el-icon><Minus /></el-icon>
        </div>
        <div class="maximize" @click="maximize">
          <el-icon><FullScreen /></el-icon>
        </div>
        <div class="close" @click="close">
          <el-icon><CloseBold /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import logo from '../assets/electron.svg'
const platform = window.electron.process.platform
// 最小化
const minimize = () => {
  window.electron.ipcRenderer.send('detach:service', { type: 'minimize' })
}
// 最大化
const maximize = () => {
  window.electron.ipcRenderer.send('detach:service', { type: 'maximize' })
}
// 关闭窗口
const close = () => {
  window.electron.ipcRenderer.send('detach:service', { type: 'close' })
}

// 打开开发者工具
const openDevTool = () => {
  window.electron.ipcRenderer.send('detach:service', { type: 'devtool' })
}
</script>

<style lang="scss" scoped>
.handle-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
}
.handle-info {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-left: 12px;
}
.handle-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-right: 12px;
  .window-handle {
    display: flex;
    > div {
      padding: 0 8px;
    }
  }
}
</style>
