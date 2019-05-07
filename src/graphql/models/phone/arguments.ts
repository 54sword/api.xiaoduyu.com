
// 储存
export const addPhone = {
  phone: (data: string) => ({
    typename: 'save',
    name: 'phone',
    value: data,
    type: 'String!',
    desc:'手机'
  }),
  area_code: (data: string) => ({
    typename: 'save',
    name: 'area_code',
    value: data,
    type: 'String!',
    desc:'手机国家代码'
  }),
  captcha: (data: string) => ({
    typename: 'save',
    name: 'captcha',
    value: data,
    type: 'String!',
    desc:'验证码'
  }),
  unlock_token: (data: string) => ({
    typename: 'save',
    name: 'unlock_token',
    value: data,
    type: 'String',
    desc:'解锁令牌（getUnlockToken），解锁身份后获得，用于修改已绑定的手机号'
  })
}

/*
// 更新
const update = {
  // 筛选参数
  filters: {
    captcha: data => ({
      name: 'captcha',
      value: data,
      type: 'String!',
      desc:'验证码'
    })
  },
  // 更新内容
  content: {
    phone: data => ({
      name: 'phone',
      value: data,
      type: 'String!',
      desc:'手机'
    }),
    area_code: data => ({
      name: 'area_code',
      value: data,
      type: 'String!',
      desc:'手机国家代码'
    })
  }
}
*/

