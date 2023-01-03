import { getMenu } from '@/api/user'
import { constantRoutes, asyncRoutes } from '@/router'

const hasPermission = (modules, route) => {
  if (route.meta) {
    return modules.some(module => route.path === module.frondEndUrl)
  } else {
    return true
  }
}

const state = {
  routes: constantRoutes,
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  // get user menu
  getMenu({ commit, state }) {
    return new Promise((resolve, reject) => {
      getMenu().then(async res => {
        if (res.data.code === 400) {
          return reject(res)
        }

        const { data } = res
        const accessRouters = await asyncRoutes.filter(item => {
          if (hasPermission(data, item)) {
            if (item.children && item.children.length > 0) {
              item.children = item.children.filter(child => {
                if (hasPermission(data, child)) {
                  return child
                }
                return false
              })
              return item
            } else {
              return item
            }
          }
          return false
        })
        commit('SET_ROUTES', accessRouters)
        resolve(accessRouters)
      }).catch(error => {
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
