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
  topic_id: data => ({
    name: 'topic_id', value: data,
    type: 'ID', desc:'话题ID'
  }),
  type: data => ({
    name: 'type', value: data,
    type: 'Int', desc:'类型'
  }),
  title: data => ({
    name: 'title', value: data,
    type: 'String', desc:'标题'
  }),
  content: data => ({
    name: 'content', value: data,
    type: 'String', desc:'正文JSON Draft'
  }),
  content_html: data => ({
    name: 'content_html', value: data,
    type: 'String', desc:'正文HTML'
  }),
  verify: data => ({
    name: 'verify', value: data, role: 'admin',
    type: 'Boolean', desc:'验证'
  }),
  recommend: data => ({
    name: 'recommend', value: data, role: 'admin',
    type: 'Boolean', desc:'推荐'
  }),
  sort_by_date: data => ({
    name: 'sort_by_date', value: data, role: 'admin',
    type: 'String', desc:'根据时间排序（越大越排前）'
  })
}

export default { queryList, updateList }
