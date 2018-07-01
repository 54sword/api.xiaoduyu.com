
// 查询
const query = {
  // 筛选条件
  filters: {},
  // 排序，page size，page number
  options: {}
}

// 储存
const save = {
  phone: data => ({
    name: 'phone', value: data,
    type: 'String!', desc:'手机'
  }),
  area_code: data => ({
    name: 'area_code', value: data,
    type: 'String!', desc:'手机国家代码'
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
  filters: {
    captcha: data => ({
      name: 'captcha', value: data,
      type: 'String!', desc:'验证码'
    })
  },
  // 更新内容
  content: {
    phone: data => ({
      name: 'phone', value: data,
      type: 'String!', desc:'手机'
    }),
    area_code: data => ({
      name: 'area_code', value: data,
      type: 'String!', desc:'手机国家代码'
    }),

  }
}

export default { query, save, update }
