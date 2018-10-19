import * as ParseParams from '../comment/parse-params';

// 查询
const query = {
  // 筛选条件
  filters: {
    _id: data => ({
      name: '_id',
      value: ParseParams.id(data),
      type: 'ID',
      desc:'id、ids、exists、not-exists'
    }),
    weaken: data => ({
      name: 'weaken',
      value: data,
      type: 'Boolean',
      desc:'削弱'
    }),
    deleted: data => ({
      name: 'deleted',
      value: data,
      type: 'Boolean',
      desc:'删除'
    }),
    recommend: data => ({
      name: 'recommend',
      value: data,
      type: 'Boolean',
      desc:'推荐'
    }),
    end_create_at: data => ({
      name: 'create_at',
      value: { '$lte': data },
      type: 'String',
      desc:'结束日期'
    }),
    start_create_at: data => ({
      name: 'create_at',
      value: { '$gte': data },
      type: 'String',
      desc:'开始日期'
    }),
    user_id: data => ({
      name: 'user_id',
      value: ParseParams.id(data),
      type: 'ID',
      desc:'用户ID，id、ids、exists、not-exists'
    }),
    posts_id: data => ({
      name: 'posts_id',
      value: ParseParams.id(data),
      type: 'ID',
      desc:'帖子ID，id、ids、exists、not-exists'
    }),
    parent_id: data => ({
      name: 'parent_id',
      value: ParseParams.id(data),
      type: 'ID',
      desc:'父评论id，id、ids、exists、not-exists'
    })
  },
  // 排序，page size，page number
  options: {
    page_number: data => ({
      name: 'skip',
      value: data - 1 >= 0 ? data - 1 : 0,
      type: 'Int',
      desc:'第几页'
    }),
    page_size: data => ({
      name: 'limit',
      value: data,
      type: 'Int',
      desc:'每页数量'
    }),
    sort_by: data => ({
      name: 'sort',
      value: ParseParams.sortBy(data),
      type: 'String',
      desc:'排序方式例如: create_at:1,update_at:-1，排序字段: create_at、update_at、last_reply_at、reply_count、like_count'
    })
  }
}

// 储存
const save = {
  posts_id: data => ({
    name: 'posts_id',
    value: data,
    type: 'ID',
    desc:'posts_id'
  }),
  reply_id: data => ({
    name: 'reply_id',
    value: data,
    type: 'ID',
    desc:'reply_id'
  }),
  parent_id: data => ({
    name: 'parent_id',
    value: data,
    type: 'ID',
    desc:'parent_id'
  }),
  content: data => ({
    name: 'content',
    value: data,
    type: 'String',
    desc:'内容'
  }),
  content_html: data => ({
    name: 'content_html',
    value: data,
    type: 'String',
    desc:'内容HTML'
  }),
  device: data => ({
    name: 'device',
    value: data,
    type: 'String',
    desc:'设备id'
  })
}

// 更新
const update = {
  // 筛选参数
  filters: {
    _id: data => ({
      name: '_id',
      value: data,
      type: 'ID!',
      desc:'ID'
    })
  },
  // 更新内容
  content: {
    deleted: data => ({
      name: 'deleted',
      value: data,
      role: 'admin',
      type: 'Boolean',
      desc:'删除'
    }),
    weaken: data => ({
      name: 'weaken',
      value: data,
      role: 'admin',
      type: 'Boolean',
      desc:'削弱'
    }),
    recommend: data => ({
      name: 'recommend',
      value: data,
      role: 'admin',
      type: 'Boolean',
      desc:'推荐'
    }),
    content: data => ({
      name: 'content',
      value: data,
      type: 'String',
      desc:'评论DraftJS JSON'
    }),
    content_html: data => ({
      name: 'content_html',
      value: data,
      type: 'String',
      desc:'评论HTML'
    })
  }
}

export default { query, save, update }
