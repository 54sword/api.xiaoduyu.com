/*
import * as ParseParams from '../../common/parse-params';

export const ads = {
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

export const addAD = {
  pc_img: (data: string) => ({
    typename: 'save',
    name: 'pc_img',
    value: data,
    type: 'String',
    desc:'PC站广告图片：560x320'
  }),
  pc_url: (data: string) => ({
    typename: 'save',
    name: 'pc_url',
    value: data,
    type: 'String',
    desc:'PC站广告网址'
  }),
  app_img: (data: string) => ({
    typename: 'save',
    name: 'app_img',
    value: data,
    type: 'String',
    desc:'APP广告图片：560x320'
  }),
  app_url: (data: string) => ({
    typename: 'save',
    name: 'app_url',
    value: data,
    type: 'String',
    desc:'APP广告网址'
  }),
  close: (data: boolean) => ({
    typename: 'save',
    name: 'close',
    value: data,
    type: 'Boolean',
    desc:'关闭广告'
  }),
}

export const updateAD = {
  _id: (data: string): object => ({
    typename: 'query',
    name: '_id',
    value: ParseParams.id(data),
    type: 'ID',
    desc:'id、ids、exists、not-exists'
  }),
  pc_img: (data: string) => ({
    typename: 'save',
    name: 'pc_img',
    value: data,
    type: 'String',
    desc:'PC站广告图片：560x320'
  }),
  pc_url: (data: string) => ({
    typename: 'save',
    name: 'pc_url',
    value: data,
    type: 'String',
    desc:'PC站广告网址'
  }),
  app_img: (data: string) => ({
    typename: 'save',
    name: 'app_img',
    value: data,
    type: 'String',
    desc:'APP广告图片：560x320'
  }),
  app_url: (data: string) => ({
    typename: 'save',
    name: 'app_url',
    value: data,
    type: 'String',
    desc:'APP广告网址'
  }),
  close: (data: boolean) => ({
    typename: 'save',
    name: 'close',
    value: data,
    type: 'Boolean',
    desc:'关闭广告'
  }),
  block_date: (data: string) => ({
    typename: 'save',
    name: 'block_date',
    value: data,
    role: 'admin',
    type: 'String',
    desc:'屏蔽广告的到该日期'
  }),
  delete: (data: boolean) => ({
    typename: 'save',
    name: 'delete',
    value: data,
    role: 'admin',
    type: 'Boolean',
    desc:'删除广告'
  }),
}
*/