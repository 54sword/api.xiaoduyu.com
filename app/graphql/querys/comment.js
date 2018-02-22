// query 参数白名单，以及监测参数是否合法
const queryList = {
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
}

const optionList = {
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

export default { queryList, optionList }
