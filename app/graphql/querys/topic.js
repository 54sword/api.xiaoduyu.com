// query 参数白名单，以及监测参数是否合法
const queryList = {
  _id: data => ({
    name: '_id', value: data,
    type: 'ID', desc:'ID'
  }),
  parent_id: data => ({
    name: 'topic_id', value: data,
    type: 'ID', desc:'父类ID'
  }),
  deleted: data => ({
    name: 'deleted', value: data, role: 'admin',
    type: 'Boolean', desc:'删除'
  }),
  weaken: data => ({
    name: 'weaken', value: data,
    type: 'Boolean', desc:'削弱'
  }),
  recommend: data => ({
    name: 'recommend', value: data,
    type: 'Boolean', desc:'推荐'
  }),
  type: data => ({
    name: 'parent_id', value: { '$exists': data == 'parent' },
    type: 'String', desc:'参数 parent，只查询父类'
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
