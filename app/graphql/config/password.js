
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
      name: 'user_id', value: data, type: 'ID!', desc:'用户id'
    }),
    current_password: data => ({
      name: 'current_password', value: data, type: 'String!', desc:'当前密码'
    }),
    new_password: data => ({
      name: 'new_password', value: data, type: 'String!', desc:'新密码'
    })
  },
  // 更新内容
  content: {
  }
}

export default { query, save, update }
