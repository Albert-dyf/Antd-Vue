import request from '@/utils/request'

const root = '/merchant/api/haoScreen/module/merchant/api/common/resource'
const securityPre = root + '/system/security'
const countryPre = root + '/country/base'
const screenPre = root + '/screen/type'
const operatorPre = root + '/merchant/operator'
const providerPre = root + '/provider/balance/log'
const customerPre = root + '/customer/balance/log'

export function getCheckCode() {
  return request(securityPre + '/getCheckCode')
}

export function getEncryptorPublicKey() {
  return request(securityPre + '/getPublicKey')
}

export function getCountryList(params) {
  return request(countryPre + '/list', {
    method: 'GET',
    params
  })
}

export function getScreenType() {
  return request(screenPre + '/list')
}

export function getOperatorList(params) {
  return request(operatorPre + '/list', {
    method: 'get',
    params
  })
}

export function getProviderBillList(params) {
  return request(providerPre + '/list', {
    method: 'get',
    params
  })
}

export function getCustomerBillList(params) {
  return request(customerPre + '/list', {
    method: 'get',
    params
  })
}
