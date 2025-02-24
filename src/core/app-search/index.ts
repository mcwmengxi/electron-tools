import envRecogn from '../../common/utils/env'

let syncModule
if (envRecogn.windows()) {
  import('./window').then((res) => (syncModule = res.default))
}

export default {
  getSearchList: async () => {
    const res = await syncModule()
    return res
  }
}
