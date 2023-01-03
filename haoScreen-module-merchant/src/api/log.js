import request from '@/utils/request'

const root = '/manager/api/haoScreen/module/manager/api/log/manage'
const managePre = root + '/manager/log'

/**
 * get
 */
export function getManageLog(params) {
  return request(managePre + '/list', {
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
