import request from '@/utils/request'

const root = '/merchant/api/haoScreen/module/merchant/api/super/manage'
const operatorPre = root + '/merchant/operator'
const operatorRolePre = operatorPre + '/role'
const rolePre = root + '/manage/role'
const roleModulePre = rolePre + '/module'
const modulePre = root + '/manage/module'
const merchantRolePre = root + '/merchant/role'
const merchantRoleModulePre = merchantRolePre + '/module'
const merchantModulePre = root + '/merchant/module'

/**
 * get
 */
export function getOperators(params) {
  return request(operatorPre + '/list', {
    method: 'GET',
    params
  })
}

export function getOperatorRolesById(operatorId) {
  return request(operatorRolePre + '/list', {
    method: 'GET',
    params: { operatorId }
  })
}

export function getRoles(params) {
  return request(rolePre + '/list', {
    method: 'GET',
    params
  })
}

export function getRoleById(roleId) {
  return request(rolePre + '/initModifyAll', {
    method: 'POST',
    params: { roleId }
  })
}

export function getModules() {
  return request(modulePre + '/list')
}

export function getModuleById(moduleId) {
  return request(modulePre + '/initModifyAll', {
    method: 'GET',
    params: { moduleId }
  })
}

export function getRoleModuleConfig(roleId) {
  return request(roleModulePre + '/list', {
    method: 'GET',
    params: { roleId }
  })
}

export function getMerchantRoles(params) {
  return request(merchantRolePre + '/list', {
    method: 'GET',
    params
  })
}

export function getMerchantRoleById(roleId) {
  return request(merchantRolePre + '/initModifyAll', {
    method: 'GET',
    params: { roleId }
  })
}

export function getMerchantRoleModuleConfig(roleId) {
  return request(merchantRoleModulePre + '/list', {
    method: 'GET',
    params: { roleId }
  })
}

export function getMerchantModules() {
  return request(merchantModulePre + '/list')
}

export function getMerchantModuleById(moduleId) {
  return request(merchantModulePre + '/initModifyAll', {
    method: 'GET',
    params: { moduleId }
  })
}

/**
 * add
 */
export function addOperator(data) {
  return request(operatorPre + '/add', {
    method: 'POST',
    params: { ...data }
  })
}

export function addRole(data) {
  return request(rolePre + '/add', {
    method: 'POST',
    params: { ...data }
  })
}

export function addModule(data) {
  return request(modulePre + '/add', {
    method: 'POST',
    params: { ...data }
  })
}

export function addMerchantRole(data) {
  return request(merchantRolePre + '/add', {
    method: 'POST',
    params: { ...data }
  })
}

export function addMerchantModule(data) {
  return request(merchantModulePre + '/add', {
    method: 'POST',
    params: { ...data }
  })
}

/**
 * delete
 */
export function deleteOperator(operatorId) {
  return request(operatorPre + '/deleteSafely', {
    method: 'POST',
    params: { operatorId }
  })
}

export function deleteRole(roleId) {
  return request(rolePre + '/deleteSafely', {
    method: 'POST',
    params: { roleId }
  })
}

export function deleteModule(moduleId) {
  return request(modulePre + '/deleteSafely', {
    method: 'POST',
    params: { moduleId }
  })
}

export function deleteMerchantRole(roleId) {
  return request(merchantRolePre + '/deleteSafely', {
    method: 'POST',
    params: { roleId }
  })
}

export function deleteMerchantModule(moduleId) {
  return request(merchantModulePre + '/deleteSafely', {
    method: 'POST',
    params: { moduleId }
  })
}

/**
 * update
 */
export function updateOperator(operatorId, enable) {
  const url = enable === 1 ? '/enable' : '/disable'
  return request(operatorPre + url, {
    method: 'POST',
    params: { operatorId }
  })
}

export function updateRole(data) {
  return request(rolePre + '/modifyAll', {
    method: 'POST',
    params: { ...data }
  })
}

export function updateModule(data) {
  return request(modulePre + '/modifyAll', {
    method: 'POST',
    params: { ...data }
  })
}

export function updateRoleModuleAuthorized(data) {
  return request(roleModulePre + '/set', {
    method: 'POST',
    params: { ...data }
  })
}

export function updateOperatorRoleAuthorized(data) {
  return request(operatorRolePre + '/set', {
    method: 'POST',
    params: { ...data }
  })
}

export function updateMerchantRole(data) {
  return request(merchantRolePre + '/modifyAll', {
    method: 'POST',
    params: { ...data }
  })
}

export function updateMerchantRoleModuleAuthorized(data) {
  return request(merchantRoleModulePre + '/set', {
    method: 'POST',
    params: { ...data }
  })
}

export function updateMerchantModule(data) {
  return request(merchantModulePre + '/modifyAll', {
    method: 'POST',
    params: { ...data }
  })
}
