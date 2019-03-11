import * as ParseParams from '../../common/parse-params';

// 查询
export const sessions = {
  _id: (data: string): object => ({
    typename: 'query',
    name: '_id',
    value: ParseParams.id(data),
    type: 'ID',
    desc:'id、ids、exists、not-exists'
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

export const getSession = {
  people_id: (data: string): object => ({
    typename: 'save',
    name: 'addressee_id',
    value: data,
    type: 'ID',
    desc:'id'
  })
}

export const readSession = {
  _id: (data: string): object => ({
    typename: 'query',
    name: '_id',
    value: data,
    type: 'ID',
    desc:'id'
  })
}