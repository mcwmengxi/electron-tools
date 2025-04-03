<template>
  <div v-show="!currentPlugin.name" class="options">
    <div
      v-if="
        !options.length && !searchValue && !clipboardFile.length && config?.perf?.common?.history
      "
      class="history-plugins"
    >
      <el-row>
        <el-col
          v-for="(item, index) in pluginHistory"
          :key="index"
          :class="currentSelect === index ? 'active history-item' : 'history-item'"
          :span="3"
          @click="() => openPlugin(item)"
          @contextmenu.prevent="openMenu($event, item)"
        >
          <a-avatar style="width: 28px; height: 28px" :src="item.icon" />
          <div class="name ellpise">
            {{ item.cmd || item.pluginName || item._name || item.name }}
          </div>
          <div v-if="item.pin" class="badge"></div>
        </el-col>
      </el-row>
    </div>
    <a-list v-else item-layout="horizontal" :data-source="sortOptions">
      <template #renderItem="{ item, index }">
        <a-list-item
          :class="currentSelect === index ? 'active op-item' : 'op-item'"
          @click="() => item.click()"
        >
          <a-list-item-meta :description="renderDesc(item.desc)">
            <template #title>
              <span v-html="renderTitle(item.name, item.match)"></span>
            </template>
            <template #avatar>
              <a-avatar style="border-radius: 0" :src="item.icon" />
            </template>
          </a-list-item-meta>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import useLocalConfig from '@renderer/composables/useLocalConfig'
import { computed } from 'vue'

const props = defineProps({
  searchValue: {
    type: [String, Number],
    default: ''
  },
  currentPlugin: {
    type: Object,
    default: () => ({})
  },
  pluginHistory: {
    type: Array<Recordable>,
    default: () => []
  },
  options: {
    type: Array<Recordable>,
    default: () => []
  },
  currentSelect: {
    type: Number,
    default: 0
  },
  clipboardFile: {
    type: Array<Recordable>,
    default: () => []
  }
})

const { config, getConfig } = useLocalConfig()
getConfig()
const emit = defineEmits(['choosePlugin', 'setPluginHistory'])
const sortOptions = computed(() => sort(props.options))
const sort = (options) => {
  for (let i = 0; i < options.length; i++) {
    for (let j = i + 1; j < options.length; j++) {
      if (options[j].zIndex > options[i].zIndex) {
        let temp = options[i]
        options[i] = options[j]
        options[j] = temp
      }
    }
  }
  return options.slice(0, 20)
}

const openPlugin = (item: Recordable) => {
  emit('choosePlugin', item)
}
const openMenu = (e, item) => {
  e.preventDefault()
  console.log(e, item)
}

const renderTitle = (title, match) => {
  if (typeof title !== 'string') return
  if (!props.searchValue || !match) return title
  const result = title.substring(match[0], match[1] + 1)
  return `<div>${title.substring(
    0,
    match[0]
  )}<span style='color: var(--ant-error-color)'>${result}</span>${title.substring(
    match[1] + 1,
    title.length
  )}</div>`
}

const renderDesc = (desc = '') => {
  if (desc.length > 80) {
    return `${desc.substr(0, 63)}...${desc.substr(desc.length - 14, desc.length)}`
  }
  return desc
}
</script>

<style lang="less" scoped>
.ellpise {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
.contextmenu {
  margin: 0;
  background: #fff;
  z-index: 3000;
  position: absolute;
  list-style-type: none;
  padding: 5px 0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 400;
  color: #333;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
}
.options {
  position: absolute;
  top: 60px;
  left: 0;
  width: 100%;
  z-index: 99;
  max-height: calc(~'100vh - 60px');
  overflow: auto;
  background: var(--color-body-bg);
  .history-plugins {
    width: 100%;
    border-top: 1px dashed var(--color-border-light);
    box-sizing: border-box;
    .history-item {
      cursor: pointer;
      box-sizing: border-box;
      height: 69px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      color: var(--color-text-content);
      border-right: 1px dashed var(--color-border-light);
      position: relative;
      .badge {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 0;
        height: 0;
        border-radius: 4px;
        border-top: 6px solid var(--ant-primary-4);
        border-right: 6px solid var(--ant-primary-4);
        border-left: 6px solid transparent;
        border-bottom: 6px solid transparent;
      }
      &.active {
        background: var(--color-list-hover);
      }
    }
    .name {
      font-size: 12px;
      margin-top: 4px;
      width: 100%;
      text-align: center;
    }
  }
  .op-item {
    padding: 0 10px;
    height: 70px;
    line-height: 50px;
    max-height: 500px;
    overflow: auto;
    background: var(--color-body-bg);
    color: var(--color-text-content);
    border-color: var(--color-border-light);
    border-bottom: 1px solid var(--color-border-light) !important;
    &.active {
      background: var(--color-list-hover);
    }
    .ant-list-item-meta-title {
      color: var(--color-text-content);
    }
    .ant-list-item-meta-description {
      color: var(--color-text-desc);
    }
  }
}
</style>
