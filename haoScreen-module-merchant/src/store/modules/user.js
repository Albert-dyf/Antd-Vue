import { login, logout, getInfo } from '@/api/user'
import { resetRouter } from '@/router'
import { setToken, removeToken } from '@/utils/auth' // get token from cookie
import router from '@/router'

const getDefaultState = () => {
  return {
    avatar: '',
    createTime: '',
    email: '',
    lastLoginTime: '',
    level: '',
    merchantName: '',
    name: '',
    nickName: '',
    token: ''
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_EMAIL: (state, email) => {
    state.email = email
  },
  SET_CREATETIME: (state, createTime) => {
    state.createTime = createTime
  },
  SET_ID: (state, id) => {
    state.id = id
  },
  SET_LASTLOGINTIME: (state, lastLoginTime) => {
    state.lastLoginTime = lastLoginTime
  },
  SET_NICKNAME: (state, nickName) => {
    state.nickName = nickName
  },
  SET_LEVEL: (state, level) => {
    state.level = level
  },
  SET_MERCHANTNAME: (state, merchantName) => {
    state.merchantName = merchantName
  }
}

const actions = {
  // user login
  login({ commit }, loginForm) {
    return new Promise((resolve, reject) => {
      login(loginForm).then(response => {
        // const { data } = response
        console.log('login success')
        const token = response.data.token
        commit('SET_TOKEN', token)
        setToken(token)
        // console.log('success')
        resolve(response)
      }).catch(error => {
        console.log(error.data.msg)
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo().then(response => {
        console.log(response)
        if (response.data.code === 400) {
          return reject(response)
        }

        const { data } = response

        // console.log(data)
        if (!data) {
          return reject('Verification failed, please Login again.')
        }

        commit('SET_EMAIL', data.email)
        commit('SET_NICKNAME', data.nickName)
        commit('SET_CREATETIME', data.createTime)
        commit('SET_LASTLOGINTIME', data.lastLoginTime)
        commit('SET_LEVEL', data.level)
        commit('SET_MERCHANTNAME', data.merchantName)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }, redirect) {
    return new Promise((resolve, reject) => {
      logout().then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        router.push(`/login?redirect=${redirect || '#'}`)
        resolve()
      // }).catch(error => {
      // reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

