// query 参数白名单，以及监测参数是否合法
const queryList = {
  _id: data => ({
    name: '_id', value: data,
    type: 'ID', desc:'ID'
  }),
  sender_id: data => ({
    name: 'sender_id', value: data,
    type: 'ID', desc:'发送人用户ID'
  }),
  addressee_id: data => ({
    name: 'addressee_id', value: data,
    type: 'ID', desc:'收件人用户ID'
  }),
  posts_id: data => ({
    name: 'posts_id', value: data,
    type: 'ID', desc:'帖子ID'
  }),
  comment_id: data => ({
    name: 'comment_id', value: data,
    type: 'ID', desc:'评论ID'
  }),
  deleted: data => ({
    name: 'deleted', value: data, role: 'admin',
    type: 'Boolean', desc:'删除'
  }),
  type: data => ({
    name: 'type', value: data,
    type: 'String', desc:'类型'
  }),
  has_read: data => ({
    name: 'has_read', value: data,
    type: 'Boolean', desc:'是否已读'
  }),
  end_create_at: data => ({
    name: 'create_at', value: { '$lte': data },
    type: 'String', desc:'结束日期'
  }),
  start_create_at: data => ({
    name: 'create_at', value: { '$gte': data },
    type: 'String', desc:'开始日期'
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

    return ({
      name: 'sort', value,
      type: 'String', desc:'排序方式'
    })
  }

}

export default { queryList, optionList }
