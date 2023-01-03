import Layout from '@/layout'

const reportManage = {
  path: '/report',
  component: Layout,
  redirect: 'noRedirect',
  meta: {
    title: 'reportManage',
    icon: 'el-icon-data-line'
  },
  children: [
    {
      path: 'achievement',
      component: () => import('@/views/report/achievement'),
      meta: {
        title: 'achievementReport',
        breadcrumb: true
      }
    }
  ]
}

export default reportManage
