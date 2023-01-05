import request from '@/utils/request'

const root = '/merchant/api/haoScreen/module/merchant/api/log/manage'
const merchantPre = root + '/merchant/log'
const customerPre = root + '/customer/log'

/**
 * get
 */
export function getMerchantLog(params) {
  return request(merchantPre + '/list', {
    methods: 'get',
    params
  })
}

export function getCustomerLog(params) {
  return request(customerPre + '/list', {
    methods: 'get',
    params
  })
}

/**
 * add
 */

/**
 * update
 */

/**
 * delete
 */
