import areaCode from './areaCode.json'
import countryCode from './countryCode.json'
import { isValidPhoneNumber } from 'libphonenumber-js'

export function getCountryNameZh(code) {
  return countryCode[code]
}

// 根据号码获取国码
export function getCountryCode(phone) {
  // 全球号码通过前四位区分不同地区，且不同地区前四位数不存在重复
  // 号码前四位分别取出 eg. 86 1125467898
  const fourDigit = phone.substr(0, 4) // eg. 8611 -- null
  const threeDigit = phone.substr(0, 3) // eg. 861 -- null
  const twoDigit = phone.substr(0, 2) // eg. 86 -- CN
  const firstDigit = phone.substr(0, 1) // eg. 8 -- null

  // const countryCode = areaCode[firstDigit] || areaCode[twoDigit] || areaCode[threeDigit] || areaCode[fourDigit]
  let countryCode = null
  // const countryCode = areaCode[firstDigit] ? areaCode[twoDigit] ? areaCode[threeDigit] ? areaCode[fourDigit]
  //   ? areaCode[fourDigit] : areaCode[threeDigit] : areaCode[twoDigit] : areaCode[firstDigit] : null
  countryCode = areaCode[fourDigit] || areaCode[threeDigit] || areaCode[twoDigit] || areaCode[firstDigit]
  // for (let index = 4; index > 0; index--) {
  // const digit = phone.substr(0, index)
  // console.log(digit)
  // countryCode = areaCode[digit]
  if (countryCode) {
    return countryCode // eg. CN
  }
  // }
}

export function formatCountryAndPhoneNumber(arr) {
  // const enterTime = new Date().getTime()
  const countryPhoneMap = new Map()
  arr.forEach((tel, index) => {
    const code = getCountryCode(tel)
    // console.log(code)
    if (code) {
      if (isValidPhoneNumber(tel, code)) { // 根据国码检测号码是否有效
        // console.log('validate true')
        const country = countryPhoneMap.get(code) ||
          {
            countryCode: code,
            countryNameZh: getCountryNameZh(code),
            phoneList: [],
            availableCount: 0
          }
        const phoneList = country.phoneList
        phoneList.push(tel)
        country.availableCount = phoneList.length
        countryPhoneMap.set(code, country)
      }
    }
  })
  // console.log([...countryPhoneMap.values()])
  // console.log(new Date().getTime() - enterTime)
  return [...countryPhoneMap.values()]
}
