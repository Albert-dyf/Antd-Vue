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
      path: '/log/merchant',
      component: () => import('@/views/log/merchant'),
      meta: {
        title: 'merchantLog',
        breadcrumb: true
      }
    },
    {
      path: '/log/customer',
      component: () => import('@/views/log/customer'),
      meta: {
        title: 'customerLog',
        breadcrumb: true
      }
    }
  ]
}

export default LogManage
