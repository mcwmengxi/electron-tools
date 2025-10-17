<template>
  <a-menu :selected-keys="active" mode="vertical" @select="changeMenu">
    <a-menu-item key="finder">
      <template #icon>
        <StarOutlined style="font-size: 16px" />
      </template>
      {{ $t('feature.market.explore') }}
    </a-menu-item>
    <a-menu-item key="worker">
      <template #icon>
        <SendOutlined style="transform: rotate(-45deg); font-size: 16px" />
      </template>
      {{ $t('feature.market.efficiency') }}
    </a-menu-item>
    <a-menu-item key="tools">
      <template #icon>
        <SearchOutlined style="font-size: 16px" />
      </template>
      {{ $t('feature.market.searchTool') }}
    </a-menu-item>
    <a-menu-item key="image">
      <template #icon>
        <FileImageOutlined style="font-size: 16px" />
      </template>
      {{ $t('feature.market.imageTool') }}
    </a-menu-item>
    <a-menu-item key="devPlugin">
      <template #icon>
        <CodeOutlined style="font-size: 16px" />
      </template>
      {{ $t('feature.market.developTool') }}
    </a-menu-item>
    <a-menu-item key="system">
      <template #icon>
        <DatabaseOutlined style="font-size: 16px" />
      </template>
      {{ $t('feature.market.systemTool') }}
    </a-menu-item>
    <a-sub-menu class="user-info">
      <template #icon>
        <a-avatar :size="32">
          <template #icon>
            <img :src="perf.custom.logo" />
          </template>
        </a-avatar>
      </template>
      <template #title>{{ perf.custom.username }}</template>
      <a-menu-item key="settings">
        <template #icon>
          <SettingOutlined />
        </template>
        {{ $t('feature.settings.title') }}
      </a-menu-item>
      <a-menu-item key="installed">
        <template #icon>
          <HeartOutlined />
        </template>
        {{ $t('feature.installed.title') }}
      </a-menu-item>
      <a-menu-item key="dev">
        <template #icon>
          <BugOutlined />
        </template>
        {{ $t('feature.dev.title') }}
      </a-menu-item>
    </a-sub-menu>
  </a-menu>
</template>

<script setup lang="ts">
import { usePluginMarketStore } from '@/stores/pluginMarket'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  StarOutlined,
  SendOutlined,
  SearchOutlined,
  FileImageOutlined,
  DatabaseOutlined,
  CodeOutlined,
  SettingOutlined,
  HeartOutlined,
  BugOutlined
} from '@ant-design/icons-vue'
import useConfig from '@/hooks/useConfig'
const router = useRouter()
const pluginMarketStore = usePluginMarketStore()
const { getConfig } = useConfig()
const { perf } = getConfig()
const active = computed(() => pluginMarketStore.active)
const changeMenu = ({ key }: { key: string }) => {
  pluginMarketStore.commonUpdate({ active: [key] })
  router.push(key)
}

pluginMarketStore.init()
</script>
