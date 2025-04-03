/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, any>
  export default component
}

interface Window {
  setSubInput: ({ placeholder }: { placeholder: string }) => void
  setSubInputValue: ({ value }: { value: string }) => void
  removeSubInput: () => void
  getMainInputInfo: () => any
}
