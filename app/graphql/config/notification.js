import * as ParseParams from '../comment/parse-params';

// 查询
const query = {
  // 筛选条件
  filters: {
    _id: data => ({
      name: '_id',
      value: ParseParams.id(data),
      type: 'ID',
      desc:'ID'
    }),
    sender_id: data => ({
      name: 'sender_id',
      value: ParseParams.id(data),
      type: 'ID',
      desc:'发送者用户ID'
    }),
    addressee_id: data => ({
      name: 'addressee_id',
      value: ParseParams.id(data),
      type: 'ID',
      desc:'收件用户ID'
    }),
    deleted: data => ({
      name: 'deleted',
      value: data,
      type: 'Boolean',
      desc:'删除'
    }),
    type: data => ({
      name: 'type',
      value: data,
      type: 'String',
      desc:'通知类型'
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
      desc:'排序方式: create_at:1'
    })
  }
}

// 储存
const save = {
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
    })
  }
}

export default { query, save, update }
