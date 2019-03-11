import * as ParseParams from '../../common/parse-params';

export const users = {
  _id: (data: string) => ({
    typename: 'query',
    name: '_id',
    value: ParseParams.id(data),
    type: 'ID',
    desc:'ID'
  }),
  nickname: (data: string) => ({
    typename: 'query',
    name: 'nickname',
    value: ParseParams.search(data),
    type: 'String',
    desc:'昵称'
  }),
  blocked: (data: boolean) => ({
    typename: 'query',
    name: 'deleted',
    value: data,
    role: 'admin',
    type: 'Boolean',
    desc:'屏蔽'
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
  banned_to_post: (data: string) => ({
    typename: 'query',
    name: 'banned_to_post',
    value: { '$gte': new Date() },
    role: 'admin',
    type: 'String',
    desc:'禁言的用户'
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

export const addUser = {
  email: (data: string) => ({
    typename: 'save',
    name: 'email',
    value: data,
    type: 'String',
    desc:'邮箱'
  }),
  phone: (data: string) => ({
    typename: 'save',
    name: 'phone',
    value: data,
    type: 'String',
    desc:'手机'
  }),
  area_code: (data: string) => ({
    typename: 'save',
    name: 'area_code',
    value: data,
    type: 'String',
    desc:'手机区号'
  }),
  nickname: (data: string) => ({
    typename: 'save',
    name: 'nickname',
    value: data,
    type: 'String!',
    desc:'昵称'
  }),
  password: (data: string) => ({
    typename: 'save',
    name: 'password',
    value: data,
    type: 'String!',
    desc:'密码'
  }),
  captcha: (data: string) => ({
    typename: 'save',
    name: 'captcha',
    value: data,
    type: 'String!',
    desc:'验证码'
  }),
  source: (data: number) => ({
    typename: 'save',
    name: 'source',
    value: data,
    type: 'Int',
    desc:'来源id'
  }),
  gender: (data: number) => ({
    typename: 'save',
    name: 'gender',
    value: data,
    type: 'Int',
    desc:'性别 0女 / 1男'
  })
}

export const updateUser = {
  _id: (data: string) => ({
    typename: 'query',
    name: '_id',
    value: data,
    type: 'ID!',
    desc:'ID'
  }),
  blocked: (data: boolean) => ({
    typename: 'save',
    name: 'blocked',
    value: data,
    role: 'admin',
    type: 'Boolean',
    desc:'屏蔽用户'
  }),
  banned_to_post: (data: string) => ({
    typename: 'save',
    name: 'banned_to_post',
    value: data,
    role: 'admin',
    type: 'String',
    desc:'禁言时间'
  }),
  avatar: (data: string) => ({
    typename: 'save',
    name: 'avatar',
    value: data,
    type: 'String',
    desc:'头像'
  }),
  brief: (data: string) => ({
    typename: 'save',
    name: 'brief',
    value: data,
    type: 'String',
    desc:'一句话自我介绍'
  }),
  gender: (data: number) => ({
    typename: 'save',
    name: 'gender',
    value: data,
    type: 'Int',
    desc:'性别'
  }),
  nickname: (data: string) => ({
    typename: 'save',
    name: 'nickname',
    value: data,
    type: 'String',
    desc:'昵称'
  }),
  theme: (data: string) => ({
    typename: 'save',
    name: 'theme',
    value: data,
    type: 'Int',
    desc:'主题（0自动，1亮色，2暗色）'
  }),
}
