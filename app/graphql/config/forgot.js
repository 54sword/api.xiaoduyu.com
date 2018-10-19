
// 查询
const query = {
  // 筛选条件
  filters: {},
  // 排序，page size，page number
  options: {}
}

// 储存
const save = {
}

// 更新
const update = {
  // 筛选参数
  filters: {
    phone: data => ({
      name: 'phone',
      value: data,
      type: 'String',
      desc:'手机号'
    }),
    email: data => ({
      name: 'email',
      value: data,
      type: 'String',
      desc:'邮箱'
    }),
    captcha: data => ({
      name: 'captcha',
      value: data,
      type: 'String!',
      desc:'验证码'
    }),
    new_password: data => ({
      name: 'new_password',
      value: data,
      type: 'String!',
      desc:'新密码'
    })
  },
  // 更新内容
  content: {
  }
}

export default { query, save, update }
