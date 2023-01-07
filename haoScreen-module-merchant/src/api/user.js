import request from '@/utils/request'

const root = '/merchant/api/haoScreen/module/merchant/api/system/frame'
const authPre = root + '/system/auth'
const initPre = root + '/system/init'
const authInfoPre = root + '/individual/manage'
const dashboardPre = root + '/system/dashboard'

export function login(data) {
  return request({
    url: authPre + '/login',
    method: 'post',
    params: { ...data }
  })
}

export function getInfo() {
  return request({
    url: authInfoPre + '/getInfo',
    method: 'get'
  })
}

export function getMenu() {
  return request({
    url: initPre + '/getMenu',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: authPre + '/logout',
    method: 'post'
  })
}

export function modifyPwd(data) {
  return request({
    url: authInfoPre + '/modifyPassword',
    method: 'post',
    params: { ...data }
  })
}

export function getSelfOrderAmount() {
  return request(dashboardPre + '/orderAmountMine', {
    method: 'get'
  })
}

export function getTotalOrderAmount() {
  return request(dashboardPre + '/orderAmountTotal', {
    method: 'get'
  })
}

export function getMerchantOrderAmount() {
  return request(dashboardPre + '/childOrderAmountTotal', {
    method: 'get'
  })
}

export function getSelfOrderCount() {
  return request(dashboardPre + '/orderCountMine', {
    method: 'get'
  })
}

export function getTotalOrderCount() {
  return request(dashboardPre + '/orderCountTotal', {
    method: 'get'
  })
}

export function getMerchantOrderCount() {
  return request(dashboardPre + '/childOrderCountTotal', {
    method: 'get'
  })
}

export function getOrderListAll() {
  return request(dashboardPre + '/orderListAll', {
    method: 'get'
  })
}

export function getOrderListMine() {
  return request(dashboardPre + '/orderListAllMine', {
    method: 'get'
  })
}
