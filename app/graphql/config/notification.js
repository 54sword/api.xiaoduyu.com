
// 查询
const query = {
  // 筛选条件
  filters: {
    _id: data => ({
      name: '_id', value: data,
      type: 'ID', desc:'ID'
    }),
    sender_id: data => ({
      name: 'sender_id', value: data,
      type: 'ID', desc:'发送者用户ID'
    }),
    addressee_id: data => ({
      name: 'addressee_id', value: data,
      type: 'ID', desc:'收件用户ID'
    }),
    deleted: data => ({
      name: 'deleted', value: data,
      type: 'Boolean', desc:'删除'
    }),
    type: data => ({
      name: 'type', value: data,
      type: 'String', desc:'通知类型'
    }),
    end_create_at: data => ({
      name: 'create_at', value: { '$lte': data },
      type: 'String', desc:'结束日期'
    }),
    start_create_at: data => ({
      name: 'create_at', value: { '$gte': data },
      type: 'String', desc:'开始日期'
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
  name: data => ({
    name: 'name', value: data, role: 'admin',
    type: 'String!', desc:'名称'
  }),
  brief: data => ({
    name: 'brief', value: data, role: 'admin',
    type: 'String!', desc:'简介'
  }),
  description: data => ({
    name: 'description', value: data, role: 'admin',
    type: 'String!', desc:'描述'
  }),
  avatar: data => ({
    name: 'avatar', value: data, role: 'admin',
    type: 'String!', desc:'头像url地址'
  }),
  background: data => ({
    name: 'background', value: data, role: 'admin',
    type: 'String', desc:'背景图片'
  }),
  sort: data => ({
    name: 'sort', value: data, role: 'admin',
    type: 'Int', desc:'排序'
  }),
  recommend: data => ({
    name: 'recommend', value: data, role: 'admin',
    type: 'Boolean', desc:'推荐'
  }),
  parent_id: data => ({
    name: 'parent_id', value: data, role: 'admin',
    type: 'ID', desc:'父类ID'
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
    deleted: data => ({
      name: 'deleted', value: data, role: 'admin',
      type: 'Boolean', desc:'删除'
    })
  }
}

export default { query, save, update }
