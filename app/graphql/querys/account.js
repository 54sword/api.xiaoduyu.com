// query 参数白名单，以及监测参数是否合法
const queryList = {
  email: data => ({ name: 'email', value: data }),
  phone: data => ({ name: 'phone', value: data }),
  password: data => ({ name: 'password', value: data }),
  captcha: data => ({ name: 'captcha', value: data }),
  captcha_id: data => ({ name: 'captcha_id', value: data })
}

const optionList = {}

export default { queryList, optionList }
