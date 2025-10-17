import useConfig from '@/hooks/useConfig'
import axios from 'axios'

let baseURL = 'https://gitee.com/monkeyWang/rubickdatabase/raw/master'
let access_token = ''

const { getConfig } = useConfig()
const { data = {} } = getConfig()
baseURL = data.database
access_token = data.access_token

const instance = axios.create({
  timeout: 4000,
  baseURL: baseURL || 'https://gitee.com/monkeyWang/rubickdatabase/raw/master'
})

export default {
  async getTotalPlugins() {
    let targetPath = 'plugins/total-plugins.json'
    if (access_token) {
      targetPath = `${encodeURIComponent(targetPath)}?access_token=${access_token}&ref=master`
    }
    const res = await instance.get(targetPath)
    console.log('total plugsin', res)
    return res.data
  }
}
