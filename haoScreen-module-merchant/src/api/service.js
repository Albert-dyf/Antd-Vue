import request from '@/utils/request'

const root = '/merchant/api/haoScreen/module/manager/api/customer/service'
const customerPre = root + '/customer/base/all'
const taskPre = root + '/screen/task/all'
const providerPre = root + '/provider/base/all'
const billPre = customerPre + '/balance/log'
const routingPre = customerPre + '/quotation'

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

export function getCustomerBill(params) {
  return request(billPre + '/list', {
    method: 'get',
    params
  })
}

export function getCustomerRouting(params) {
  return request(routingPre + '/list', {
    method: 'get',
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
    method: 'put',
    params: { customerId }
  })
}

export function disableCustomer(customerId) {
  return request(customerPre + '/disable', {
    method: 'put',
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

export function updateCustomerRouting(data) {
  return request(routingPre + '/setSingle', {
    method: 'post',
    params: { ...data }
  })
}

export function updateCustomerRoutingAll(data) {
  return request(routingPre + '/setAll', {
    method: 'post',
    params: { ...data }
  })
}

export function updateRoutingStatus(quotationId, enable) {
  const url = enable ? '/enable' : '/disable'
  return request(routingPre + url, {
    method: 'post',
    params: { quotationId }
  })
}

/**
 * delete
 */
