import request from '@/utils/request'

const root = '/merchant/api/haoScreen/module/merchant/api/business/manage'
const customerPre = root + '/customer/mine/base'
const taskPre = root + '/customer/mine/task'
const routingPre = root + '/channel/routing/mine'
const billPre = root + '/customer/mine/balance/log'

/**
 * get
 */
export function getCustomerList(params) {
  return request(customerPre + '/list', {
    methods: 'get',
    params
  })
}

export function getCustomerTask(params) {
  return request(taskPre + '/list', {
    method: 'get',
    params
  })
}

export function getRoutingList(params) {
  return request(routingPre + '/list', {
    method: 'get',
    params
  })
}

export function getRoutingById(routingId) {
  return request(routingPre + '/initModifyAll', {
    method: 'get',
    params: { routingId }
  })
}

export function getCustomerBillList(params) {
  return request(billPre + '/list', {
    method: 'get',
    params
  })
}

/**
 * add
 */
export function addCustomer(data) {
  return request(customerPre + '/add', {
    method: 'post',
    params: { ...data }
  })
}

export function addRouting(data) {
  return request(routingPre + '/add', {
    method: 'post',
    params: { ...data }
  })
}

/**
 * update
 */
export function updateRouting(data) {
  return request(routingPre + '/modifyAll', {
    method: 'post',
    params: { ...data }
  })
}

export function updateCustomerStatus(customerId, enable) {
  const url = enable ? '/enable' : '/disable'
  return request(customerPre + url, {
    method: 'post',
    params: { customerId }
  })
}

/**
 * delete
 */
export function deleteCustomer(customerId) {
  return request(customerPre + '/deleteSafely', {
    method: 'post',
    params: { customerId }
  })
}

export function undoRouting(routingId) {
  return request(routingPre + '/deleteSafely', {
    method: 'post',
    params: { routingId }
  })
}
