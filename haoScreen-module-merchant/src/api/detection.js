import request from '@/utils/request'
import { removeEmptyAttr } from '@/utils/index'

const root = '/customer/api/haoScreen/module/customer/screen/manage'
const taskPre = root + '/screen/task'

export function addDetectMission(data) {
  return request(taskPre + '/add', {
    method: 'POST',
    params: { ...data }
  })
}

export function getDetectMissionRecord(params) {
  return request(taskPre + '/list', {
    method: 'GET',
    params: removeEmptyAttr(params)
  })
}

export function downloadTaskSourceFile(taskId) {
  return request(taskPre + '/downloadSource', {
    method: 'GET',
    params: {
      taskId
    }
  })
}

export function downloadTaskResultFile(taskId) {
  return request(taskPre + '/downloadResult', {
    method: 'GET',
    params: {
      taskId
    }
  })
}
