import Layout from '@/layout'

const sourceManage = {
  path: '/source',
  component: Layout,
  redirect: 'noRedirect',
  alwaysShow: true,
  meta: {
    title: 'sourceManage',
    icon: 'el-icon-files'
  },
  children: [
    {
      path: '/source/provider',
      component: () => import('@/views/source/provider'),
      meta: {
        title: 'providerManage',
        breadcrumb: true
      }
    },
    {
      path: '/source/channel',
      component: () => import('@/views/source/channel'),
      meta: {
        title: 'channelManage',
        breadcrumb: true
      }
    },
    {
      path: '/source/routing',
      component: () => import('@/views/source/routing'),
      meta: {
        title: 'channelRouting',
        breadcrumb: true
      }
    }
  ]
}

export default sourceManage
