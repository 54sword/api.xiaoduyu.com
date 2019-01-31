
// 查询
const query = {
  // 筛选条件
  filters: {
  },
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
    user_id: data => ({
      name: 'user_id',
      value: data,
      type: 'ID!',
      desc:'用户id'
    }),
    unlock_token: data => ({
      name: 'unlock_token',
      value: data,
      type: 'String',
      desc:'解锁令牌（getUnlockToken），解锁身份后获得，用于修改已绑定的邮箱地址'
    }),
    // current_password: data => ({
    //   name: 'current_password',
    //   value: data,
    //   type: 'String!',
    //   desc:'当前密码'
    // }),
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
