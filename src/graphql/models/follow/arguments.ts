import * as ParseParams from '../../common/parse-params';

// 查询
export const findFollows = {
  user_id: (data: string) => ({
    typename: 'query',
    name: 'user_id',
    value: ParseParams.id(data),
    type: 'String',
    desc:'用户ID：id、ids、exists、not-exists'
  }),
  topic_id: (data: string) => ({
    typename: 'query',
    name: 'topic_id',
    value: ParseParams.id(data),
    type: 'String',
    desc:'话题ID：id、ids、exists、not-exists'
  }),
  posts_id: (data: string) => ({
    typename: 'query',
    name: 'posts_id',
    value: ParseParams.id(data),
    type: 'String',
    desc:'帖子ID：id、ids、exists、not-exists'
  }),
  people_id: (data: string) => ({
    typename: 'query',
    name: 'people_id',
    value: ParseParams.id(data),
    type: 'String',
    desc:'用户ID：id、ids、exists、not-exists'
  }),
  // 因为int类型长度大于11位，graphql 会认为格式不是int
  start_create_at: (data: string) => ({
    typename: 'query',
    name: 'create_at',
    value: { '$gte': data },
    type: 'String',
    desc:'开始日期'
  }),
  end_create_at: (data: string) => ({
    typename: 'query',
    name: 'create_at',
    value: { '$lte': data },
    type: 'String',
    desc:'结束日期'
  }),
  deleted: (data: boolean) => ({
    typename: 'query',
    name: 'deleted',
    value: data,
    type: 'Boolean',
    desc:'删除'
  }),

  page_number: (data: number) => ({
    typename: 'option',
    name: 'skip',
    value: data - 1 >= 0 ? data - 1 : 0,
    type: 'Int',
    desc:'第几页'
  }),
  page_size: (data: number) => ({
    typename: 'option',
    name: 'limit',
    value: data,
    type: 'Int',
    desc:'每页数量'
  }),
  sort_by: (data: string) => ({
    typename: 'option',
    name: 'sort',
    value: ParseParams.sortBy(data),
    type: 'String',
    desc:'排序方式例如: create_at:1，排序字段: create_at'
  })
}

// 储存
export const addFollow = {
  topic_id: (data: string) => ({
    typename: 'save',
    name: 'topic_id',
    value: data,
    type: 'String',
    desc:'话题ID'
  }),
  posts_id: (data: string) => ({
    typename: 'save',
    name: 'posts_id',
    value: data,
    type: 'String',
    desc:'帖子ID'
  }),
  user_id: (data: string) => ({
    typename: 'save',
    name: 'user_id',
    value: data,
    type: 'String',
    desc:'用户ID'
  }),
  status: (data: boolean) => ({
    typename: 'save',
    name: 'status',
    value: data,
    type: 'Boolean',
    desc:'关注状态'
  })
}
