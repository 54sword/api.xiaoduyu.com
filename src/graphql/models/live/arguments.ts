
import * as ParseParams from '../../common/parse-params';

export const live = {
  _id: (data: string): object => ({
    typename: 'query',
    name: '_id',
    value: ParseParams.id(data),
    type: 'ID',
    desc:'id、ids、exists、not-exists'
  }),
  user_id: (data: string) => ({
    typename: 'query',
    name: 'user_id',
    value: ParseParams.id(data),
    type: 'ID',
    desc:'用户ID'
  }),
  status: (data: string) => ({
    typename: 'query',
    name: 'status',
    value: data,
    type: 'Boolean',
    desc:'是否正在直播中'
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
    desc:'排序方式: create_at:1,comment_count:-1,like_count:1'
  })
}

export const addLive = {
  title: (data: string) => ({
    typename: 'save',
    name: 'title',
    value: data,
    type: 'String',
    desc:'标题'
  }),
  cover_image: (data: string) => ({
    typename: 'save',
    name: 'cover_image',
    value: data,
    type: 'String',
    desc:'封面图片'
  })
}

export const updateLive = {
  _id: (data: string): object => ({
    typename: 'query',
    name: '_id',
    value: ParseParams.id(data),
    type: 'ID',
    desc:'id、ids、exists、not-exists'
  }),
  title: (data: string) => ({
    typename: 'save',
    name: 'title',
    value: data,
    type: 'String',
    desc:'标题'
  }),
  notice: (data: string) => ({
    typename: 'save',
    name: 'notice',
    value: data,
    type: 'String',
    desc:'公告'
  }),
  cover_image: (data: string) => ({
    typename: 'save',
    name: 'cover_image',
    value: data,
    type: 'String',
    desc:'封面图片'
  }),
  ban_date: (data: string) => ({
    typename: 'save',
    name: 'ban_date',
    value: data,
    role: 'admin',
    type: 'String',
    desc:'屏蔽直播的日期，小于日期内不允许直播'
  }),
  blocked: (data: boolean) => ({
    typename: 'save',
    name: 'blocked',
    value: data,
    role: 'admin',
    type: 'Boolean',
    desc:'禁止直播'
  }),
  status: (data: boolean) => ({
    typename: 'save',
    name: 'status',
    value: data,
    type: 'Boolean',
    desc:'是否正在直播的状态'
  }),
}