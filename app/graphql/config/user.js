
// 查询
const query = {
  // 筛选条件
  filters: {
    _id: data => ({
      name: '_id', value: data,
      type: 'ID', desc:'ID'
    }),
    blocked: data => ({
      name: 'deleted', value: data, role: 'admin',
      type: 'Boolean', desc:'屏蔽'
    }),
    end_create_at: data => ({
      name: 'create_at', value: { '$lte': data },
      type: 'String', desc:'结束日期'
    }),
    start_create_at: data => ({
      name: 'create_at', value: { '$gte': data },
      type: 'String', desc:'开始日期'
    }),
    banned_to_post: data => ({
      name: 'banned_to_post', value: { '$gte': new Date() }, role: 'admin',
      type: 'String', desc:'禁言的用户'
    })
  },
  // 排序，page size，page number
  options: {

    page_number: data => ({
      name: 'skip', value: data - 1 >= 0 ? data - 1 : 0,
      type: 'Int', desc:'第几页'
    }),

    page_size: data => ({
      name: 'limit', value: data,
      type: 'Int', desc:'每页数量'
    }),

    sort_by: data => {

      let value = {}
      value[data] = -1

      return ({
        name: 'sort', value,
        type: 'String', desc:'排序方式'
      })
    }

  }
}

// 储存
const save = {
  email: data => ({
    name: 'email', value: data, type: 'String!', desc:'邮箱'
  }),
  phone: data => ({
    name: 'phone', value: data, type: 'String!', desc:'手机'
  }),
  area_code: data => ({
    name: 'area_code', value: data, type: 'String!', desc:'手机区号'
  }),
  nickname: data => ({
    name: 'nickname', value: data, type: 'String!', desc:'昵称'
  }),
  password: data => ({
    name: 'password', value: data, type: 'String!', desc:'密码'
  }),
  captcha: data => ({
    name: 'captcha', value: data, type: 'String!', desc:'验证码'
  }),
  source: data => ({
    name: 'source', value: data, type: 'Int', desc:'来源id'
  })
}

// 更新
const update = {
  // 筛选参数
  filters: {
    _id: data => ({
      name: '_id', value: data,
      type: 'ID!', desc:'ID'
    })
  },
  // 更新内容
  content: {
    blocked: data => ({
      name: 'blocked', value: data, role: 'admin',
      type: 'Boolean', desc:'屏蔽用户'
    }),
    banned_to_post: data => ({
      name: 'banned_to_post', value: data, role: 'admin',
      type: 'String', desc:'禁言时间'
    }),
    avatar: data => ({
      name: 'avatar', value: data,
      type: 'String', desc:'头像'
    }),
    brief: data => ({
      name: 'brief', value: data,
      type: 'String', desc:'一句话自我介绍'
    }),
    gender: data => ({
      name: 'gender', value: data,
      type: 'Int', desc:'性别'
    }),
    nickname: data => ({
      name: 'nickname', value: data,
      type: 'String', desc:'昵称'
    })
  }
}

export default { query, save, update }
