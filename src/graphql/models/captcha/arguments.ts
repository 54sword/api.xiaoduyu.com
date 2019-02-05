
// 查询
export const getCaptcha = {
  id: (data: string): object => ({
    typename: 'query',
    name: '_id',
    value: data,
    type: 'ID',
    desc:'ID'
  }),
  phone: (data: string): object => ({
    typename: 'query',
    name: 'phone',
    value: data,
    type: 'String',
    desc:'ID'
  }),
  email: (data: string): object => ({
    typename: 'query',
    name: 'email',
    value: data,
    type: 'String',
    desc:'ID'
  })
}

// 储存
export const addCaptcha = {
  email: (data: string): object => ({
    typename: 'save',
    name: 'email',
    value: data,
    type: 'String',
    desc:'邮箱[email]'
  }),
  phone: (data: string): object => ({
    typename: 'save',
    name: 'phone',
    value: data,
    type: 'String',
    desc:'手机[phone]'
  }),
  area_code: (data: string): object => ({
    typename: 'save',
    name: 'area_code',
    value: data,
    type: 'String',
    desc:'手机国家代码[phone]'
  }),
  type: (data: string): object => ({
    typename: 'save',
    name: 'type',
    value: data,
    type: 'String!',
    desc:'类型 - sign-in、binding-email、reset-email、sign-up、forgot、binding-phone、reset-phone、unlock-token'
  })
}
