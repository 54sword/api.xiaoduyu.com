
// 查询
export const signIn = {
  email: (data: string): object => ({
    typename: 'query',
    name: 'email',
    value: data,
    type: 'String',
    desc:'邮箱'
  }),
  phone: (data: string): object => ({
    typename: 'query',
    name: 'phone',
    value: data,
    type: 'String',
    desc:'电话'
  }),
  password: (data: string): object => ({
    typename: 'query',
    name: 'password',
    value: data,
    type: 'String!',
    desc:'密码'
  }),
  captcha: (data: string): object => ({
    typename: 'query',
    name: 'captcha',
    value: data,
    type: 'String',
    desc:'验证码'
  }),
  captcha_id: (data: string): object => ({
    typename: 'query',
    name: 'captcha_id',
    value: data,
    type: 'String',
    desc:'验证码id'
  })
}

// 储存
export const addEmail = {
  email: (data: string): object => ({
    typename: 'save',
    name: 'email',
    value: data,
    type: 'String!',
    desc:'邮箱地址'
  }),
  captcha: (data: string): object => ({
    typename: 'save',
    name: 'captcha',
    value: data,
    type: 'String!',
    desc:'验证码'
  }),
  unlock_token: (data: string): object => ({
    typename: 'save',
    name: 'unlock_token',
    value: data,
    type: 'String',
    desc:'解锁令牌（getUnlockToken），解锁身份后获得，用于修改已绑定的邮箱地址'
  })
}
