<script setup lang="ts">
import TitleBar from './components/TitleBar.vue'
import Versions from './components/Versions.vue'
import useDrag from './utils/dragWindow'

const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

const { onMouseDown } = useDrag()
</script>

<template>
  <div id="components-layout" class="container" @mousedown="onMouseDown">
    <TitleBar />
    <img alt="logo" class="logo" src="./assets/electron.svg" />
    <div class="creator">Powered by electron-vite</div>
    <div class="text">
      Build an Electron app with
      <span class="vue">Vue</span>
      and
      <span class="ts">TypeScript</span>
    </div>
    <p class="tip">Please try pressing <code>F12</code> to open the devTool</p>
    <div class="actions">
      <div class="action">
        <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">Documentation</a>
      </div>
      <div class="action">
        <a target="_blank" rel="noreferrer" @click="ipcHandle">Send IPC</a>
      </div>
    </div>
    <Versions />
  </div>
</template>
