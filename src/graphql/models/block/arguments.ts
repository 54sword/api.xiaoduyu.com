import * as ParseParams from '../../common/parse-params';

// 查询
export const blocks = {
  people_id: (data: string): object => ({
    typename: 'query',
    name: 'people_id',
    value: ParseParams.id(data),
    type: 'ID',
    desc:'id、ids、exists、not-exists'
  }),
  posts_id: (data: string): object => ({
    typename: 'query',
    name: 'posts_id',
    value: ParseParams.id(data),
    type: 'ID',
    desc:'id、ids、exists、not-exists'
  }),
  comment_id: (data: string): object => ({
    typename: 'query',
    name: 'comment_id',
    value: ParseParams.id(data),
    type: 'ID',
    desc:'id、ids、exists、not-exists'
  }),
  page_number: (data: number): object => ({
    typename: 'options',
    name: 'skip',
    value: data - 1 >= 0 ? data - 1 : 0,
    type: 'Int',
    desc:'第几页，从1开始'
  }),
  page_size: (data: string): object => ({
    typename: 'options',
    name: 'limit',
    value: data,
    type: 'Int',
    desc:'每页数量'
  }),
  sort_by: (data: string): object => ({
    typename: 'options',
    name: 'sort',
    value: ParseParams.sortBy(data),
    type: 'String',
    desc:'排序方式，例如：create_at:1'
  })
}

// 储存
export const addBlock = {
  posts_id: (data: string): object => ({
    typename: 'save',
    name: 'posts_id',
    value: data,
    type: 'ID',
    desc: '帖子ID'
  }),
  comment_id: (data: string): object => ({
    typename: 'save',
    name: 'comment_id',
    value: data,
    type: 'ID',
    desc: '评论ID'
  }),
  people_id: (data: string): object => ({
    typename: 'save',
    name: 'people_id',
    value: data,
    type: 'ID',
    desc: '用户ID'
  })
}

// 更新
export const removeBlock = {
  posts_id: (data: string): object => ({
    typename: 'query',
    name: 'posts_id',
    value: data,
    type: 'ID',
    desc: '帖子ID'
  }),
  comment_id: (data: string): object => ({
    typename: 'query',
    name: 'comment_id',
    value: data,
    type: 'ID',
    desc: '评论ID'
  }),
  people_id: (data: string): object => ({
    typename: 'query',
    name: 'people_id',
    value: data,
    type: 'ID',
    desc: '用户ID'
  })
}