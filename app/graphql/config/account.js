
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
const save = {
  email: data => ({
    name: 'email', value: data,
    type: 'String!', desc:'邮箱地址'
  }),
  captcha: data => ({
    name: 'captcha', value: data,
    type: 'String!', desc:'验证码'
  }),
  unlock_token: data => ({
    name: 'unlock_token', value: data,
    type: 'String', desc:'解锁令牌（getUnlockToken），解锁身份后获得，用于修改已绑定的邮箱地址'
  })
}


// 更新
const update = {
  // 筛选参数
  filters: {},
  // 更新内容
  content: {}
}

export default { query, save, update }
