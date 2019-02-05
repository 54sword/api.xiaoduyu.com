

export const forgot = {
  phone: (data: string) => ({
    typename: 'query',
    name: 'phone',
    value: data,
    type: 'String',
    desc:'手机号'
  }),
  email: (data: string) => ({
    typename: 'query',
    name: 'email',
    value: data,
    type: 'String',
    desc:'邮箱'
  }),
  captcha: (data: string) => ({
    typename: 'query',
    name: 'captcha',
    value: data,
    type: 'String!',
    desc:'验证码'
  }),
  new_password: (data: string) => ({
    typename: 'save',
    name: 'new_password',
    value: data,
    type: 'String!',
    desc:'新密码'
  })
}