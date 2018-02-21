// query 参数白名单，以及监测参数是否合法
const queryList = {
  _id: data => ({
    name: '_id', value: data,
    type: 'ID!', desc:'ID'
  })
}

const updateList = {
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

export default { queryList, updateList }
