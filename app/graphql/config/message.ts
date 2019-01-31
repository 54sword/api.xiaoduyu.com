import * as ParseParams from '../common/parse-params';

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
    user_id: data => ({
      name: 'user_id',
      value: ParseParams.id(data),
      type: 'ID',
      desc:'用户ID，id、ids、exists、not-exists'
    }),
    addressee_id: data => ({
      name: 'addressee_id',
      value: ParseParams.id(data),
      type: 'ID',
      desc:'id、ids、exists、not-exists'
    }),
    end_create_at: data => ({
      name: 'create_at',
      value: { '$lt': data },
      type: 'String',
      desc:'结束日期'
    }),
    start_create_at: data => ({
      name: 'create_at',
      value: { '$gt': data },
      type: 'String',
      desc:'开始日期'
    }),
    deleted: data => ({
      name: 'deleted',
      value: data,
      type: 'Boolean',
      desc:'删除'
    }),
    blocked: data => ({
      name: 'blocked',
      value: data,
      type: 'Boolean',
      desc:'屏蔽'
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
  addressee_id: data => ({
    name: 'addressee_id',
    value: data,
    type: 'ID',
    desc:'收件人id'
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
    blocked: data => ({
      name: 'blocked',
      value: data,
      role: 'admin',
      type: 'Boolean',
      desc:'削弱'
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
