import * as ParseParams from '../../common/parse-params';

// 查询
export const notifications = {
  _id: (data: string) => ({
    typename: 'query',
    name: '_id',
    value: ParseParams.id(data),
    type: 'ID',
    desc:'ID'
  }),
  sender_id: (data: string) => ({
    typename: 'query',
    name: 'sender_id',
    value: ParseParams.id(data),
    type: 'ID',
    desc:'发送者用户ID'
  }),
  addressee_id: (data: string) => ({
    typename: 'query',
    name: 'addressee_id',
    value: ParseParams.id(data),
    type: 'ID',
    desc:'收件用户ID'
  }),
  deleted: (data: boolean) => ({
    typename: 'query',
    name: 'deleted',
    value: data,
    type: 'Boolean',
    desc:'删除'
  }),
  type: (data: string) => ({
    typename: 'query',
    name: 'type',
    value: data,
    type: 'String',
    desc:'通知类型'
  }),
  end_create_at: (data: string) => ({
    typename: 'query',
    name: 'create_at',
    value: { '$lte': data },
    type: 'String',
    desc:'结束日期'
  }),
  start_create_at: (data: string) => ({
    typename: 'query',
    name: 'create_at',
    value: { '$gte': data },
    type: 'String',
    desc:'开始日期'
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
    desc:'排序方式: create_at:1'
  })
}

// 更新
export const updateNotifaction = {
  _id: (data: string) => ({
    typename: 'query',
    name: '_id',
    value: data,
    type: 'ID!',
    desc:'ID'
  }),
  deleted: (data: boolean) => ({
    typename: 'save',
    name: 'deleted',
    value: data,
    role: 'admin',
    type: 'Boolean',
    desc:'删除'
  })
}
