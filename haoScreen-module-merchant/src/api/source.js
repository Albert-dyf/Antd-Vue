import request from '@/utils/request'

const root = '/merchant/api/haoScreen/module/merchant/api/resource/manage'
const providerPre = root + '/provider/base'
const channelPre = root + '/channel/base'
const routingPre = root + '/quotation/merchant'

/**
 * get
 */
export function getProviderList(params) {
  return request(providerPre + '/list', {
    method: 'get',
    params
  })
}

export function getProviderById(providerId) {
  return request(providerPre + '/initModifyAll', {
    method: 'get',
    params: { providerId }
  })
}

export function getChannelList(params) {
  return request(channelPre + '/list', {
    method: 'get',
    params
  })
}

export function getChannelById(channelId) {
  return request(channelPre + '/initModifyAll', {
    method: 'get',
    params: { channelId }
  })
}

export function getRoutingList(params) {
  return request(routingPre + '/list', {
    method: 'get',
    params
  })
}

/**
 * add
 */
export function addProvider(data) {
  return request(providerPre + '/add', {
    method: 'post',
    params: { ...data }
  })
}

export function addChannel(data) {
  return request(channelPre + '/add', {
    method: 'post',
    params: { ...data }
  })
}

/**
 * update
 */
export function updateProvider(data) {
  return request(providerPre + '/modifyAll', {
    method: 'post',
    params: { ...data }
  })
}

export function updateProviderAppSecret(data) {
  return request(providerPre + '/modifyAppSecret', {
    method: 'post',
    params: { ...data }
  })
}

export function updateChannel(data) {
  return request(channelPre + '/modifyAll', {
    method: 'post',
    params: { ...data }
  })
}

export function updateChannelStatus(channelId, enable) {
  const url = enable === 1 ? '/enable' : '/disable'
  return request(channelPre + url, {
    method: 'post',
    params: { channelId }
  })
}

export function updateRoutingStatus(routingId, enable) {
  const url = enable === 1 ? '/enable' : '/disable'
  return request(routingPre + url, {
    method: 'post',
    params: { routingId }
  })
}

export function setAllRoutings(data) {
  return request(routingPre + '/limitPriceAll', {
    method: 'post',
    params: { ...data }
  })
}

export function setSingleRouting(data) {
  return request(routingPre + '/limitPriceSingle', {
    method: 'post',
    params: { ...data }
  })
}

/**
 * delete
 */
export function deleteProvider(providerId) {
  return request(providerPre + '/deleteSafely', {
    method: 'post',
    params: { providerId }
  })
}

export function deleteChannel(channelId) {
  return request(channelPre + '/deleteSafely', {
    method: 'post',
    params: { channelId }
  })
}
