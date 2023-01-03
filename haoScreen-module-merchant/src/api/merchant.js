import request from '@/utils/request'

const root = '/manager/api/haoScreen/module/manager/api/merchant/manage'
const basePre = root + '/distributor/base'
const quotationPre = root + '/merchant/quotation'
const operatorPre = root + '/merChant/operator'

/**
 * get
 */
export function getDistributors(params) {
  return request(basePre + '/list', {
    methods: 'get',
    params
  })
}

export function getDistributorRoutings(params) {
  return request(quotationPre + '/list', {
    methods: 'get',
    params
  })
}

export function getOperators(params) {
  return request(operatorPre + '/list', {
    method: 'get',
    params
  })
}

/**
 * add
 */
export function addDistributor(data) {
  return request(basePre + '/add', {
    method: 'post',
    params: { ...data }
  })
}

export function addOperator(data) {
  return request(operatorPre + '/add', {
    method: 'post',
    params: { ...data }
  })
}

/**
 * update
 */
export function updateDistributor(id, enable) {
  const url = enable ? '/enable' : '/disable'
  return request(basePre + url, {
    method: 'post',
    params: { id }
  })
}

export function updateDistributorRouting(data) {
  return request(quotationPre + '/setSingle', {
    method: 'post',
    params: { ...data }
  })
}

export function updateDistributorRoutingAll(data) {
  return request(quotationPre + '/setAll', {
    method: 'post',
    params: { ...data }
  })
}

export function updateOperatorStatus(operatorId, enable) {
  const url = enable ? '/enable' : '/disable'
  return request(operatorPre + url, {
    method: 'post',
    params: { operatorId }
  })
}

/**
 * delete
 */
export function deleteDistributor(id) {
  return request(basePre + '/delete', {
    method: 'post',
    params: { id }
  })
}

export function deleteOperator(operatorId) {
  return request(operatorPre + '/deleteSafely', {
    method: 'post',
    params: { operatorId }
  })
}
