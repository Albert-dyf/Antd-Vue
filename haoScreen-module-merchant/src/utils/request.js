import store from '@/store'
import axios from 'axios'
import { Message } from 'element-ui'
import { getToken } from './auth'
// import qs from 'qs'

// import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  headers: {},
  timeout: 30 * 1000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    // if (store.getters.token) {
    // let each request carry token
    // ['X-Token'] is a custom headers key
    // please modify it according to the actual situation
    config.headers['token'] = getToken() || ''
    // }

    // qs 转换请求对象为form data
    // config.data = qs.stringify(config.data)
    return config
  },
  error => {
    // do something with request error
    // console.log('request ', error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    // console.log(response)
    if (response.data.code === 200) {
      return response.data
    }

    if (response.data.code === 400) {
      if (response.data.msg.includes('Token已过期')) {
        store.dispatch('user/logout')
      }
      Message({
        message: response.data.msg,
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(response)
    }
    return response.data
  },
  error => {
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
