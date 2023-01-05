import Layout from '@/layout'

const superManage = {
  path: '/super',
  component: Layout,
  name: 'superManage',
  redirect: 'noRedirect',
  alwaysShow: true,
  meta: {
    title: 'superManage',
    icon: 'lock'
  },
  children: [
    {
      path: '/super/operator',
      component: () => import('@/views/super/operator'),
      meta: {
        title: 'operatorManage',
        breadcrumb: true
      }
    },
    {
      path: '/super/role',
      component: () => import('@/views/super/role'),
      meta: {
        title: 'roleManage',
        breadcrumb: true
      }
    },
    {
      path: '/super/module',
      component: () => import('@/views/super/module'),
      meta: {
        title: 'moduleManage',
        breadcrumb: true
      }
    },
    {
      path: '/super/merchantRole',
      component: () => import('@/views/super/merchantRole'),
      meta: {
        title: 'merchantRole',
        breadcrumb: true
      }
    },
    {
      path: '/super/merchantModule',
      component: () => import('@/views/super/merchantModule'),
      meta: {
        title: 'merchantModule',
        breadcrumb: true
      }
    }
  ]
}

export default superManage
