// query 参数白名单，以及监测参数是否合法
const queryList = {
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
