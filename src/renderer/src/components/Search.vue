<script setup lang="ts">
import useLocalConfig from '@renderer/composables/useLocalConfig'
import { PropType, ref } from 'vue'

const props = defineProps({
  searchValue: {
    type: [String, Number],
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  pluginLoading: {
    type: Boolean,
    default: false
  },
  currentPlugin: {
    type: Object,
    default: null
  },
  pluginHistory: {
    type: Array,
    default: () => []
  },
  clipboardFile: {
    type: Array as PropType<Record<string, any>>,
    default: () => []
  }
})

const emits = defineEmits([
  'update:searchValue',
  'onSearch',
  'changeCurrent',
  'closePlugin',
  'focus',
  'readClipboardContent',
  'changeSelect',
  'clearClipbord',
  'openMenu'
])
const keyword = ref('')
const searchResults = ref([])
const searchInputRef = ref()

const { config, getConfig } = useLocalConfig()
getConfig()
const getIcon = () => {
  if (props.clipboardFile[0].dataUrl) return props.clipboardFile[0].dataUrl
  try {
    return window.electron.ipcRenderer.sendSync('msg-trigger', {
      type: 'getFileIcon',
      data: { path: props.clipboardFile[0].path }
    })
  } catch (e) {
    console.log(e, '使用默认图片')

    return import('../assets/file.png')
  }
}
const trigerSearch = ({ e }) => {
  if (props.currentPlugin.name) {
    window.electron.ipcRenderer.sendSync('msg-trigger', {
      type: 'sendSubInputChangeEvent',
      data: {
        text: e
        // plugin: props.currentPlugin
      }
    })
  }
}
const handleSearch = (e) => {
  // 这里添加搜索逻辑
  console.log('搜索关键词:', e.target.value)
  trigerSearch({ e: e.target.value })
  emits('onSearch', e)
}

const handleKeydown = (e: KeyboardEvent, key: string) => {
  key !== 'space' && e.preventDefault()
  const { ctrlKey, shiftKey, altKey, metaKey } = e

  const modifiers: string[] = []
  ctrlKey && modifiers.push('ctrl')
  shiftKey && modifiers.push('shift')
  altKey && modifiers.push('alt')
  metaKey && modifiers.push('meta')
  window.electron.ipcRenderer.sendSync('msg-trigger', {
    type: 'sendPluginSomehandleKeydown',
    data: {
      keyCode: e.code,
      modifiers
    }
  })

  const disableRunPlugin =
    ((e.target as unknown as any)?.value === '' && !props.pluginHistory.length) ||
    props.currentPlugin.name
  switch (key) {
    case 'up':
    case 'left':
      emits('changeCurrent', -1)
      break
    case 'down':
    case 'right':
      emits('changeCurrent', 1)
      break
    case 'enter':
      if (disableRunPlugin) {
        return
      }
      emits('closePlugin')
      break
    case 'space':
      if (!disableRunPlugin || !config.value?.perf?.common?.space) {
        return
      }
      e.preventDefault()
      emits('closePlugin')
      break
    default:
      break
  }
}
const closeTag = () => {
  emits('changeSelect', {})
  emits('clearClipbord')
  window.electron.ipcRenderer.send('msg-trigger', {
    type: 'removePlugin'
  })
}
const checkNeedInit = (e) => {
  const { ctrlKey, metaKey } = e

  if (e.target.value === '' && e.keyCode === 8) {
    closeTag()
  }
  // 手动粘贴
  if ((ctrlKey || metaKey) && e.key === 'v') {
    emits('readClipboardContent')
  }
}

const showSeparate = () => {}
</script>

<template>
  <div class="search-container">
    <div
      v-if="!!clipboardFile.length"
      :class="clipboardFile[0]?.name ? 'clipboard-tag' : 'clipboard-img'"
    >
      <img style="margin-right: 8px" :src="getIcon()" />
      <div class="ellipse">{{ clipboardFile[0]?.name }}</div>
      <a-tag v-if="clipboardFile.length > 1" color="#aaa">
        {{ clipboardFile.length }}
      </a-tag>
    </div>
    <div v-else :class="currentPlugin.cmd ? 'tools-tag' : ''">
      <img
        class="tools-logo"
        :src="currentPlugin.logo || config?.perf?.custom?.logo"
        @click="() => emits('openMenu')"
      />
      {{ currentPlugin.logo }}
      <div v-show="currentPlugin.cmd" class="select-tag">
        {{ currentPlugin.cmd }}
      </div>
    </div>
    <div class="search-box">
      <el-input
        ref="searchInputRef"
        :modal-value="searchValue"
        type="text"
        :placeholder="pluginLoading ? '更新检测中...' : placeholder || '搜索功能...'"
        autofocus
        @input="handleSearch"
        @keydown.left="(e) => handleKeydown(e, 'left')"
        @keydown.right="(e) => handleKeydown(e, 'right')"
        @keydown.down="(e) => handleKeydown(e, 'down')"
        @keydown.tab="(e) => handleKeydown(e, 'down')"
        @keydown.up="(e) => handleKeydown(e, 'up')"
        @keydown="(e) => checkNeedInit(e)"
        @keypress.enter="(e) => handleKeydown(e, 'enter')"
        @keypress.space="(e) => handleKeydown(e, 'space')"
        @focus="emits('focus')"
      >
        <template #suffix>
          <div @click="showSeparate()">
            <el-icon><ChatDotRound /></el-icon>
          </div>
        </template>
      </el-input>
    </div>
    <div v-if="keyword" class="search-results">
      <div v-if="searchResults.length === 0" class="no-results">无搜索结果</div>
      <div v-for="(item, index) in searchResults" v-else :key="index" class="result-item">
        <!-- 搜索结果项 -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
}

.search-box {
  width: 100%;
  margin-bottom: 10px;
}

.search-box input {
  width: 100%;
  padding: 12px 20px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  background-color: #f5f5f5;
  outline: none;
  transition: all 0.3s;
}

.search-box input:focus {
  background-color: #fff;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

.search-results {
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.no-results {
  padding: 20px;
  text-align: center;
  color: #666;
}

.result-item {
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.result-item:hover {
  background-color: #f5f5f5;
}
.ellipse {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}
.clipboard-tag {
  white-space: pre;
  user-select: none;
  font-size: 16px;
  height: 32px;
  position: relative;
  align-items: center;
  display: flex;
  border: 1px solid var(--color-border-light);
  padding: 0 8px;
  margin-right: 12px;
  img {
    width: 24px;
    height: 24px;
    margin-right: 6px;
  }
}
.clipboard-img {
  white-space: pre;
  user-select: none;
  font-size: 16px;
  height: 32px;
  position: relative;
  align-items: center;
  display: flex;
  img {
    width: 32px;
    height: 32px;
  }
}
.tools-tag {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  height: 40px;
  border-radius: 9px;
  background: var(--color-list-hover);
}
.tools-logo {
  width: 32px;
  border-radius: 100%;
}
</style>
