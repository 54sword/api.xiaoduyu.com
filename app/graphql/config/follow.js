
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
  topic_id: data => ({
    name: 'topic_id', value: data, type: 'String', desc:'话题ID'
  }),
  posts_id: data => ({
    name: 'posts_id', value: data, type: 'String', desc:'帖子ID'
  }),
  user_id: data => ({
    name: 'user_id', value: data, type: 'String', desc:'用户ID'
  }),
  status: data => ({
    name: 'status', value: data, type: 'Boolean', desc:'关注状态'
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
