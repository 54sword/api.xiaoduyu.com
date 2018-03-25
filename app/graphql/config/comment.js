
// 查询
const query = {
  // 筛选条件
  filters: {
    _id: data => ({
      name: '_id', value: data,
      type: 'String', desc:'ID'
    }),
    weaken: data => ({
      name: 'weaken', value: data,
      type: 'Boolean', desc:'削弱'
    }),
    deleted: data => ({
      name: 'deleted', value: data, role: 'admin',
      type: 'Boolean', desc:'删除'
    }),
    recommend: data => ({
      name: 'recommend', value: data,
      type: 'Boolean', desc:'推荐'
    }),
    end_create_at: data => ({
      name: 'create_at', value: { '$lte': data },
      type: 'String', desc:'结束日期'
    }),
    start_create_at: data => ({
      name: 'create_at', value: { '$gte': data },
      type: 'String', desc:'开始日期'
    }),
    user_id: data => ({
      name: 'user_id', value: data,
      type: 'String', desc:'用户ID'
    }),
    posts_id: data => ({
      name: 'posts_id', value: data,
      type: 'String', desc:'帖子ID'
    }),
    parent_id: data => ({
      name: 'parent_id', value: { '$exists': data },
      type: 'Boolean', desc:'true 查询reply，false 查询 comment，不提交则同时返回两种类型'
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

      return ({ name: 'sort', value, type: 'String', desc:'排序方式' })
    }
  }
}

// 储存
const save = {
  posts_id: data => ({
    name: 'posts_id', value: data, type: 'ID', desc:'posts_id'
  }),
  reply_id: data => ({
    name: 'reply_id', value: data, type: 'ID', desc:'reply_id'
  }),
  parent_id: data => ({
    name: 'parent_id', value: data, type: 'ID', desc:'parent_id'
  }),
  content: data => ({
    name: 'content', value: data, type: 'String', desc:'内容'
  }),
  content_html: data => ({
    name: 'content_html', value: data, type: 'String', desc:'内容HTML'
  }),
  device: data => ({
    name: 'device', value: data, type: 'String', desc:'设备id'
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
    }),
    weaken: data => ({
      name: 'weaken', value: data, role: 'admin',
      type: 'Boolean', desc:'削弱'
    }),
    recommend: data => ({
      name: 'recommend', value: data, role: 'admin',
      type: 'Boolean', desc:'推荐'
    }),
    content: data => ({
      name: 'content', value: data,
      type: 'String', desc:'评论DraftJS JSON'
    }),
    content: data => ({
      name: 'content_html', value: data,
      type: 'String', desc:'评论HTML'
    })
  }
}

export default { query, save, update }
