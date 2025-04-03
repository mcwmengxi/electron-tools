import { createI18n } from 'vue-i18n'
import messages from './langs'
import useConfig from '@/hooks/useConfig'

const { getConfig } = useConfig()
const { perf }: any = getConfig()

// 2. Create i18n instance with options
const i18n = createI18n({
  legacy: false,
  locale: perf.common.lang || 'zh-CN', // set locale
  fallbackLocale: 'zh-CN', // set fallback locale
  messages // set locale messages
})

export default i18n
