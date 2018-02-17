// query 参数白名单，以及监测参数是否合法
const queryList = {
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
    name: 'deleted', value: data, role: 'admin',
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
