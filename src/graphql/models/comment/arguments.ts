import * as ParseParams from '../../common/parse-params';

// 查询
export const comments = {
  _id: (data: string): object => ({
    typename: 'query',
    name: '_id',
    value: ParseParams.id(data),
    type: 'ID',
    desc:'id、ids、exists、not-exists'
  }),
  weaken: (data: boolean): object => ({
    typename: 'query',
    name: 'weaken',
    value: data,
    type: 'Boolean',
    desc:'削弱'
  }),
  deleted: (data: boolean): object => ({
    typename: 'query',
    name: 'deleted',
    value: data,
    type: 'Boolean',
    desc:'删除'
  }),
  recommend: (data: boolean): object => ({
    typename: 'query',
    name: 'recommend',
    value: data,
    type: 'Boolean',
    desc:'推荐'
  }),
  end_create_at: (data: string): object => ({
    typename: 'query',
    name: 'create_at',
    value: { '$lt': data },
    type: 'String',
    desc:'结束日期'
  }),
  start_create_at: (data: string): object => ({
    typename: 'query',
    name: 'create_at',
    value: { '$gt': data },
    type: 'String',
    desc:'开始日期'
  }),
  user_id: (data: string): object => ({
    typename: 'query',
    name: 'user_id',
    value: ParseParams.id(data),
    type: 'ID',
    desc:'用户ID，id、ids、exists、not-exists'
  }),
  posts_id: (data: string): object => ({
    typename: 'query',
    name: 'posts_id',
    value: ParseParams.id(data),
    type: 'ID',
    desc:'帖子ID，id、ids、exists、not-exists'
  }),
  parent_id: (data: string): object => ({
    typename: 'query',
    name: 'parent_id',
    value: ParseParams.id(data),
    type: 'ID',
    desc:'父评论id，id、ids、exists、not-exists'
  }),
  method: (data: string): object => ({
    typename: 'query',
    name: '',
    value: '',
    type: 'String',
    desc:'模式(user_follow)'
  }),
  page_number: (data: number): object => ({
    typename: 'option',
    name: 'skip',
    value: data - 1 >= 0 ? data - 1 : 0,
    type: 'Int',
    desc:'第几页'
  }),
  page_size: (data: number): object => ({
    typename: 'option',
    name: 'limit',
    value: data,
    type: 'Int',
    desc:'每页数量'
  }),
  sort_by: (data: string): object => ({
    typename: 'option',
    name: 'sort',
    value: ParseParams.sortBy(data),
    type: 'String',
    desc:'排序方式例如: create_at:1,update_at:-1，排序字段: create_at、update_at、last_reply_at、reply_count、like_count'
  })
}

// 储存
export const addComment = {
  posts_id: (data: string): object => ({
    typename: 'save',
    name: 'posts_id',
    value: data,
    type: 'ID',
    desc:'posts_id'
  }),
  reply_id: (data: string): object => ({
    typename: 'save',
    name: 'reply_id',
    value: data,
    type: 'ID',
    desc:'reply_id'
  }),
  parent_id: (data: string): object => ({
    typename: 'save',
    name: 'parent_id',
    value: data,
    type: 'ID',
    desc:'parent_id'
  }),
  content: (data: string): object => ({
    typename: 'save',
    name: 'content',
    value: data,
    type: 'String',
    desc:'内容'
  }),
  content_html: (data: string): object => ({
    typename: 'save',
    name: 'content_html',
    value: data,
    type: 'String',
    desc:'内容HTML'
  }),
  device: (data: string): object => ({
    typename: 'save',
    name: 'device',
    value: data,
    type: 'String',
    desc:'设备id'
  })
}

// 更新
export const updateComment = {
  _id: (data: string): object => ({
    typename: 'query',
    name: '_id',
    value: data,
    type: 'ID!',
    desc:'ID'
  }),
  deleted: (data: boolean): object => ({
    typename: 'save',
    name: 'deleted',
    value: data,
    role: 'admin',
    type: 'Boolean',
    desc:'删除'
  }),
  weaken: (data: boolean): object => ({
    typename: 'save',
    name: 'weaken',
    value: data,
    role: 'admin',
    type: 'Boolean',
    desc:'削弱'
  }),
  recommend: (data: boolean): object => ({
    typename: 'save',
    name: 'recommend',
    value: data,
    role: 'admin',
    type: 'Boolean',
    desc:'推荐'
  }),
  content: (data: string): object => ({
    typename: 'save',
    name: 'content',
    value: data,
    type: 'String',
    desc:'评论DraftJS JSON'
  }),
  content_html: (data: string): object => ({
    typename: 'save',
    name: 'content_html',
    value: data,
    type: 'String',
    desc:'评论HTML'
  })
}
