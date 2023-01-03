const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  balance: state => state.user.balance,
  createTime: state => state.user.createTime,
  id: state => state.user.id,
  name: state => state.user.name,
  lastLoginTime: state => state.user.lastLoginTime,
  mobile: state => state.user.mobile,
  nickName: state => state.user.nickName,
  email: state => state.user.email,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  permission_routes: state => state.permission.routes,
  language: state => state.app.language
}
export default getters
