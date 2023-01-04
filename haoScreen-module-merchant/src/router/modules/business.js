import Layout from '@/layout'

const businessManage = {
  path: '/business',
  component: Layout,
  redirect: 'noRedirect',
  meta: {
    title: 'businessManage',
    icon: 'el-icon-suitcase-1'
  },
  children: [
    {
      path: '/business/customer',
      component: () => import('@/views/business/customer'),
      meta: {
        title: 'myCustomer',
        breadcrumb: true
      }
    },
    {
      path: '/business/task',
      component: () => import('@/views/business/task'),
      meta: {
        title: 'screenTask',
        breadcrumb: true
      }
    },
    {
      path: '/business/achievement',
      component: () => import('@/views/business/achievement'),
      meta: {
        title: 'myAchievement',
        breadcrumb: true
      }
    }
  ]
}

export default businessManage
