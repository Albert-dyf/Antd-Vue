import Layout from '@/layout'

const merchantManage = {
  path: '/merchant',
  component: Layout,
  redirect: 'noRedirect',
  meta: {
    title: 'merchantManage',
    icon: 'el-icon-s-shop'
  },
  children: [
    {
      path: '/merchant/distributor',
      component: () => import('@/views/merchant/distributor'),
      meta: {
        title: 'distributorManage',
        breadcrumb: true
      }
    },
    {
      path: '/merchant/operator',
      component: () => import('@/views/merchant/operator'),
      meta: {
        title: 'merchantOperator',
        breadcrumb: true
      }
    }
  ]
}

export default merchantManage
