import Layout from '@/layout'

const serviceManage = {
  path: '/service',
  component: Layout,
  redirect: 'noRedirect',
  meta: {
    title: 'serviceManage',
    icon: 'el-icon-chat-line-square'
  },
  children: [
    {
      path: '/service/customer',
      component: () => import('@/views/service/customer'),
      meta: {
        title: 'customerManage',
        breadcrumb: true
      }
    },
    {
      path: '/service/task',
      component: () => import('@/views/service/task'),
      meta: {
        title: 'screenTask',
        breadcrumb: true
      }
    },
    {
      path: '/service/provider',
      component: () => import('@/views/service/provider'),
      meta: {
        title: 'providerManage',
        breadcrumb: true
      }
    }
  ]
}

export default serviceManage
