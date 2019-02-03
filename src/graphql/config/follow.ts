import * as ParseParams from '../common/parse-params';

// 查询
const query = {
  // 筛选条件
  filters: {
    user_id: data => ({
      name: 'user_id',
      value: ParseParams.id(data),
      type: 'String',
      desc:'用户ID：id、ids、exists、not-exists'
    }),
    topic_id: data => ({
      name: 'topic_id',
      value: ParseParams.id(data),
      type: 'String',
      desc:'话题ID：id、ids、exists、not-exists'
    }),
    posts_id: data => ({
      name: 'posts_id',
      value: ParseParams.id(data),
      type: 'String',
      desc:'帖子ID：id、ids、exists、not-exists'
    }),
    people_id: data => ({
      name: 'people_id',
      value: ParseParams.id(data),
      type: 'String',
      desc:'用户ID：id、ids、exists、not-exists'
    }),
    // 因为int类型长度大于11位，graphql 会认为格式不是int
    start_create_at: data => ({
      name: 'create_at',
      value: { '$gte': data },
      type: 'String',
      desc:'开始日期'
    }),
    end_create_at: data => ({
      name: 'create_at',
      value: { '$lte': data },
      type: 'String',
      desc:'结束日期'
    }),
    deleted: data => ({
      name: 'deleted',
      value: data,
      type: 'Boolean',
      desc:'删除'
    }),
  },
  // 排序，page size，page number
  options: {
    page_number: data => ({
      name: 'skip',
      value: data - 1 >= 0 ? data - 1 : 0,
      type: 'Int',
      desc:'第几页'
    }),
    page_size: data => ({
      name: 'limit',
      value: data,
      type: 'Int',
      desc:'每页数量'
    }),
    sort_by: data => ({
      name: 'sort',
      value: ParseParams.sortBy(data),
      type: 'String',
      desc:'排序方式例如: create_at:1，排序字段: create_at'
    })
  }
}

// 储存
const save = {
  topic_id: data => ({
    name: 'topic_id',
    value: data,
    type: 'String',
    desc:'话题ID'
  }),
  posts_id: data => ({
    name: 'posts_id',
    value: data,
    type: 'String',
    desc:'帖子ID'
  }),
  user_id: data => ({
    name: 'user_id',
    value: data,
    type: 'String',
    desc:'用户ID'
  }),
  status: data => ({
    name: 'status',
    value: data,
    type: 'Boolean',
    desc:'关注状态'
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
