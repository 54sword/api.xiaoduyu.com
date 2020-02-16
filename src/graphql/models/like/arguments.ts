import * as ParseParams from '../../common/parse-params';

export const likes = {
  user_id: (data: string) => ({
    typename: 'query',
    name: 'user_id',
    value: ParseParams.id(data),
    type: 'ID',
    desc:'ID'
  }),
  type: (data: string) => ({
    typename: 'query',
    name: 'type',
    value: data,
    type: 'String',
    desc:'类型：posts、comment、reply'
  }),
  target_id: (data: string) => ({
    typename: 'query',
    name: 'target_id',
    value: ParseParams.id(data),
    type: 'String',
    desc:'类型：posts、comment、reply'
  }),
  mood: (data: string) => ({
    typename: 'query',
    name: 'mood',
    value: data,
    type: 'Int',
    desc:'心情: 1=赞'
  }),
  deleted: (data: string) => ({
    typename: 'query',
    name: 'deleted',
    value: data,
    type: 'Boolean',
    desc:'删除状态',
    role: 'admin'
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

// 储存
export const like = {
  type: (data: string) => ({
    typename: 'save',
    name: 'type',
    value: data,
    type: 'String',
    desc:'类型posts/comment/reply'
  }),
  target_id: (data: string) => ({
    typename: 'save',
    name: 'target_id',
    value: ParseParams.id(data),
    type: 'String',
    desc:'目标类型的id'
  }),
  mood: (data: number) => ({
    typename: 'save',
    name: 'mood',
    value: data,
    type: 'Int',
    desc:'心情：1是赞/2是踩'
  }),
  status: (data: boolean) => ({
    typename: 'save',
    name: 'status',
    value: data,
    type: 'Boolean',
    desc:'状态'
  })
}
