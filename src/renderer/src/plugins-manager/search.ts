import { reactive, toRefs } from 'vue'

const searchManager = () => {
  const state = reactive({
    searchValue: '',
    placeholder: ''
  })
  const setSearchValue = (value) => {
    state.searchValue = value
  }
  const onSearch = (e) => {
    const value = e.target.value
    state.searchValue = value
  }

  window.setSubInput = ({ placeholder }: { placeholder: string }) => {
    state.placeholder = placeholder
  }
  window.removeSubInput = () => {
    state.placeholder = ''
  }
  window.setSubInputValue = ({ value }: { value: string }) => {
    state.searchValue = value
  }

  window.getMainInputInfo = () => {
    return {
      value: state.searchValue,
      placeholder: state.placeholder
    }
  }

  return {
    ...toRefs(state),
    onSearch,
    setSearchValue
  }
}
export default searchManager
