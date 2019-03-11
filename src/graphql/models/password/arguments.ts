
// 更新
export const updatePassword = {
  user_id: (data: string) => ({
    typename: 'query',
    name: 'user_id',
    value: data,
    type: 'ID!',
    desc:'用户id'
  }),
  unlock_token: (data: string) => ({
    typename: 'query',
    name: 'unlock_token',
    value: data,
    type: 'String',
    desc:'解锁令牌（getUnlockToken），解锁身份后获得，用于修改已绑定的邮箱地址'
  }),
  new_password: (data: string) => ({
    typename: 'save',
    name: 'new_password',
    value: data,
    type: 'String!',
    desc:'新密码'
  })
}