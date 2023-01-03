/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string')) {
      if ((/^[0-9]+$/.test(time))) {
        // support "1548221490638"
        time = parseInt(time)
      } else {
        // support safari
        // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
        time = time.replace(new RegExp(/-/gm), '/')
      }
    }

    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value ] }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string/number} time
 * @return {number}
 */
export function parseDayStart(time) {
  return new Date(parseTime(new Date(time), '{y}-{m}-{d}') + ' 00:00:00').getTime()
}

/**
 * @param {string/number} time
 * @return {number}
 */
export function parseDayEnd(time) {
  return new Date(parseTime(new Date(time), '{y}-{m}-{d}') + ' 23:59:59').getTime()
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
  if (!search) {
    return {}
  }
  const obj = {}
  const searchArr = search.split('&')
  searchArr.forEach(v => {
    const index = v.indexOf('=')
    if (index !== -1) {
      const name = v.substring(0, index)
      const val = v.substring(index + 1, v.length)
      obj[name] = val
    }
  })
  return obj
}

/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */
export function debounce(func, wait, immediate) {
  let timeout, args, context, timestamp, result

  const later = function() {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp

    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }

  return function(...args) {
    context = this
    timestamp = +new Date()
    const callNow = immediate && !timeout
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }

    return result
  }
}

/**
 * Check if an element has a class
 * @param {HTMLElement} elm
 * @param {string} cls
 * @returns {boolean}
 */
export function hasClass(ele, cls) {
  return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'))
}

/**
 * Add class to element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function addClass(ele, cls) {
  if (!hasClass(ele, cls)) ele.className += ' ' + cls
}

/**
 * Remove class from element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function removeClass(ele, cls) {
  if (hasClass(ele, cls)) {
    const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)')
    ele.className = ele.className.replace(reg, ' ')
  }
}

// 随机生成32位字符串
export function randomString() {
  const len = 32
  const $chars =
    'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  const maxPos = $chars.length
  let pwd = ''
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return pwd
}

// 移除对象空字段
export function removeEmptyAttr(obj) {
  const newObj = {}
  Object.keys(obj).forEach(key => {
    if (obj[key] !== '') {
      newObj[key] = obj[key]
    }
  })
  return newObj
}

// 移除数组内空字符串
export function removeArrEmptyItem(arr) {
  const newArr = []
  arr.forEach(item => {
    if (item !== '') {
      newArr.push(item)
    }
  })
  return newArr
}

/**
 * 格式化表格数据值对应字符
 */
const TypeConst = {
  submitSource: ['', 'WEB客户端', 'HTTP接口', '', 'SMPP接口'],
  sendType: ['All', '立即发送', '定时发送'],
  state: ['', '待发送', '已发送'],
  payMode: ['', '线下', '支付宝', '微信', '兑换码']
}

export function formatTable(data) {
  const newTable = []
  data.forEach(item => {
    const data = {
      ...item
    }

    const StateType = Object.prototype.toString.call(item.state) === '[object String]'
    // console.log(Object.prototype.toString.call(item.state))
    // console.log(StateType)

    /**
     * 状态包含数字的类型，还包含字符串类型
     * 数字类型需要转化，字符串直接展示
     */
    data.state = !StateType ? item.state ? TypeConst.state[item.state] : '' : item.state
    data.sendType = item.sendType ? TypeConst.sendType[item.sendType] : ''
    data.submitSource = item.submitSource ? TypeConst.submitSource[item.submitSource] : ''
    data.payMode = item.payMode ? TypeConst.payMode[item.payMode] : ''
    data.topState = item.topState ? '是' : '否'
    newTable.push(data)
  })

  return newTable
}

const multiple = 100000
export function parseMoney(money) {
  return money / multiple
}

export function reverseMoney(money) {
  return Math.round(Number(money) * multiple)
}

export function parseBlob2File(res) {
  const blob = new Blob([res]) // excel,pdf,txt等
  const href = URL.createObjectURL(blob) // 创建新的URL表示指定的blob对象
  const a = document.createElement('a') // 创建a标签
  a.style.display = 'none'
  a.href = href // 指定下载链接
  a.download = name // 指定下载文件名
  a.click() // 触发下载
  URL.revokeObjectURL(a.href) // 释放URL对象
}

export function syncPages(pages, res) {
  pages.pageNumber = res.data.pageNumber
  pages.pageSize = res.data.pageSize
  pages.total = res.data.totalRows
}

export function parseModule2Tree(modules) {
  const map = new Map()
  modules.forEach(nodeData => {
    const item = {
      id: nodeData.id,
      label: nodeData.moduleNameCn,
      children: []
    }

    if (nodeData.parentId !== '0') {
      const parent = map.get(nodeData.parentId)
      // console.log(parent)

      if (parent.label) {
        parent.children.push(item)
      }
    } else {
      map.set(nodeData.id, item)
    }
  })

  // console.log(map.values())
  const newArr = []
  map.forEach(node => {
    newArr.push(node)
  })
  return newArr
}

export function parseEnumValue(EnumValue) {
  const arr = []
  EnumValue.forEach(item => {
    arr[item.value] = item
  })
  return arr
}

