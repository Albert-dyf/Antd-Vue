export function isEmail(email) {
  const emailRegex = /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/
  return emailRegex.test(email)
}

export function isPwd(pwd) {
  const pwdRegex = /^[a-zA-Z0-9~!@#$%^,._-]{6,18}$/
  return pwdRegex.test(pwd)
}

export function isNumber(num) {
  const numRegex = /[0-9]\d*/
  return numRegex.test(num)
}
