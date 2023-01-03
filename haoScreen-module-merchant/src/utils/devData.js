import { parseTime } from '@/utils/index.js'

export function getDevDataForTable(loop, itemType) {
  const tableData = []
  for (let i = 0; i < loop; i++) {
    const item = JSON.parse(JSON.stringify(itemType))
    Object.keys(item).forEach(key => {
      // console.log(typeof item[key])
      switch (typeof item[key]) {
        case 'string': item[key] = 'test'; break
        case 'number': item[key] = 1; break
        default: item[key] = 'test'
      }
    })
    item.id = i + 1 + ''
    item.remark = 'This is remark text'
    item.createTime = parseTime(Date.now())
    tableData.push(item)
  }
  return tableData
}
