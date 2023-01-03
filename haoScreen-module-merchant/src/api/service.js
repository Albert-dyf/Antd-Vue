import request from '@/utils/request'

const root = '/manager/api/haoScreen/module/manager/api/customer/service'
const customerPre = root + '/customer/base/all'
const taskPre = root + '/screen/task/all'
const providerPre = root + '/provider/base/all'

/**
 * get
 */
export function getCustomerListAll(params) {
  return request(customerPre + '/list', {
    methods: 'get',
    params
  })
}

export function getTaskList(params) {
  return request(taskPre + '/list', {
    methods: 'get',
    params
  })
}

export function getProviderAll(params) {
  return request(providerPre + '/list', {
    methods: 'get',
    params
  })
}

/**
 * add
 */
export function recharge4Customer(data) {
  return request(customerPre + '/recharge', {
    method: 'post',
    params: { ...data }
  })
}

export function allowance(data) {
  return request(taskPre + '/allowance', {
    method: 'post',
    params: { ...data }
  })
}

export function recharge4Provider(data) {
  return request(providerPre + '/recharge', {
    method: 'post',
    params: { ...data }
  })
}

/**
 * update
 */
export function enableCustomer(customerId) {
  return request(customerPre + '/enable', {
    method: 'post',
    params: { customerId }
  })
}

export function disableCustomer(customerId) {
  return request(customerPre + '/disable', {
    method: 'post',
    params: { customerId }
  })
}

export function resetPwd(customerId) {
  return request(customerPre + '/modifyPassword', {
    method: 'post',
    params: { customerId }
  })
}

export function refreshBalance(providerId) {
  return request(providerPre + '/refreshBalance', {
    method: 'post',
    params: { providerId }
  })
}

/**
 * delete
 */
