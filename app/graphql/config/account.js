
// 查询
const query = {
  // 筛选条件
  filters: {
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
  },
  // 排序，page size，page number
  options: {}
}

// 储存
const save = {}

// 更新
const update = {
  // 筛选参数
  filters: {},
  // 更新内容
  content: {}
}

export default { query, save, update }
