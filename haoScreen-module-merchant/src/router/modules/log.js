import Layout from '@/layout'

const LogManage = {
  path: '/log',
  component: Layout,
  redirect: 'noRedirect',
  meta: {
    title: 'logManage',
    icon: 'el-icon-s-platform'
  },
  children: [
    {
      path: '/log/manage',
      component: () => import('@/views/log/manage'),
      meta: {
        title: 'manageLog',
        breadcrumb: true
      }
    }
  ]
}

export default LogManage
