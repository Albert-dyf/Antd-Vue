import request from '@/utils/request'

const root = '/merchant/api/haoScreen/module/merchant/api/business/manage'
const customerPre = root + '/customer/mine/base'
const taskPre = root + '/customer/mine/task'
const billPre = root + '/customer/mine/balance/log'
const routingPre = root + '/customer/mine/quotation'

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

export function getCustomerBillList(params) {
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
export function addCustomer(data) {
  return request(customerPre + '/add', {
    method: 'post',
    params: { ...data }
  })
}

/**
 * update
 */
export function updateCustomerStatus(customerId, enable) {
  const url = enable ? '/enable' : '/disable'
  return request(customerPre + url, {
    method: 'post',
    params: { customerId }
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

export function refreshTaskStatus(taskId) {
  return request(taskPre + '/refreshStatus', {
    method: 'post',
    params: { taskId }
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
