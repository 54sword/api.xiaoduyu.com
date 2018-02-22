// query 参数白名单，以及监测参数是否合法
const queryList = {
  email: data => ({
    name: 'email', value: data, type: 'String', desc:'邮箱'
  }),
  phone: data => ({
    name: 'phone', value: data, type: 'String', desc:'电话'
  }),
  password: data => ({
    name: 'password', value: data, type: 'String!', desc:'密码'
  }),
  captcha: data => ({
    name: 'captcha', value: data, type: 'String', desc:'验证码'
  }),
  captcha_id: data => ({
    name: 'captcha_id', value: data, type: 'String', desc:'验证码id'
  })
}

const optionList = {}

export default { queryList, optionList }
