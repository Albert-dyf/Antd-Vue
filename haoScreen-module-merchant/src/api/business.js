import request from '@/utils/request'

const root = '/manager/api/haoScreen/module/manager/api/business/manage'
const customerPre = root + '/customer/base/mine'
const taskPre = root + '/screen/task/mine'
const routingPre = root + '/channel/routing/mine'

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
