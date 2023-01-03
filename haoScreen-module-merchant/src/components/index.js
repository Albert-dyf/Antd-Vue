// 导入实现，组件使用失败，功能未实现
// 按层级获取文件
const files = require.context('./', true, /index.vue$/)
const components = {}

files.keys().forEach(key => {
  components[key.replace(/(\.\/|\/index.vue)/g, '')] = files(key).default
})

export default { ...components }
