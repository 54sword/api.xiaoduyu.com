import * as ParseParams from '../../common/parse-params';

// 查询
export const topics = {
  _id: (data: string) => ({
    typename: 'query',
    name: '_id',
    value: ParseParams.id(data),
    type: 'ID',
    desc:'ID'
  }),
  parent_id: (data: string) => ({
    typename: 'query',
    name: 'parent_id',
    value: ParseParams.id(data),
    type: 'String',
    desc:'父评论id / exists / not-exists'
  }),
  deleted: (data: boolean) => ({
    typename: 'query',
    name: 'deleted',
    value: data, role: 'admin',
    type: 'Boolean',
    desc:'删除'
  }),
  weaken: (data: boolean) => ({
    typename: 'query',
    name: 'weaken',
    value: data,
    type: 'Boolean',
    desc:'削弱'
  }),
  recommend: (data: boolean) => ({
    typename: 'query',
    name: 'recommend',
    value: data,
    type: 'Boolean',
    desc:'推荐'
  }),
  type: (data: string) => ({
    typename: 'query',
    name: 'parent_id',
    value: { '$exists': data == 'parent' ? false : true },
    type: 'String',
    desc:'参数 parent，只查询父类'
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

// 储存
export const addTopic = {
  name: (data: string) => ({
    typename: 'save',
    name: 'name', value: data, role: 'admin',
    type: 'String!', desc:'名称'
  }),
  brief: (data: string) => ({
    typename: 'save',
    name: 'brief', value: data, role: 'admin',
    type: 'String!', desc:'简介'
  }),
  description: (data: string) => ({
    typename: 'save',
    name: 'description', value: data, role: 'admin',
    type: 'String!', desc:'描述'
  }),
  avatar: (data: string) => ({
    typename: 'save',
    name: 'avatar', value: data, role: 'admin',
    type: 'String!', desc:'头像url地址'
  }),
  background: (data: string) => ({
    typename: 'save',
    name: 'background', value: data, role: 'admin',
    type: 'String', desc:'背景图片'
  }),
  sort: (data: number) => ({
    typename: 'save',
    name: 'sort', value: data, role: 'admin',
    type: 'Int', desc:'排序'
  }),
  recommend: (data: boolean) => ({
    typename: 'save',
    name: 'recommend', value: data, role: 'admin',
    type: 'Boolean', desc:'推荐'
  }),
  parent_id: (data: string) => ({
    typename: 'save',
    name: 'parent_id', value: data, role: 'admin',
    type: 'ID', desc:'父类ID'
  })
}

// 更新
export const updateTopic = {
  _id: (data: string) => ({
    typename: 'query',
    name: '_id', value: data, role: 'admin',
    type: 'String!', desc:'ID'
  }),
  name: (data: string) => ({
    typename: 'save',
    name: 'name', value: data, role: 'admin',
    type: 'String', desc:'名称'
  }),
  brief: (data: string) => ({
    typename: 'save',
    name: 'brief', value: data, role: 'admin',
    type: 'String', desc:'简介'
  }),
  description: (data: string) => ({
    typename: 'save',
    name: 'description', value: data, role: 'admin',
    type: 'String', desc:'描述'
  }),
  avatar: (data: string) => ({
    typename: 'save',
    name: 'avatar', value: data, role: 'admin',
    type: 'String', desc:'头像url地址'
  }),
  background: (data: string) => ({
    typename: 'save',
    name: 'background', value: data, role: 'admin',
    type: 'String', desc:'背景图片'
  }),
  sort: (data: number) => ({
    typename: 'save',
    name: 'sort', value: data, role: 'admin',
    type: 'Int', desc:'排序'
  }),
  recommend: (data: boolean) => ({
    typename: 'save',
    name: 'recommend', value: data, role: 'admin',
    type: 'Boolean', desc:'推荐'
  }),
  parent_id: (data: string) => ({
    typename: 'save',
    name: 'parent_id', value: data, role: 'admin',
    type: 'ID', desc:'父类ID'
  })
}
