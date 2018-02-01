// query 参数白名单，以及监测参数是否合法
const queryList = {
  _id: data => ({ name: '_id', value: data })
}

const updateList = {
  deleted:      data => ({ name: 'deleted', value: data }),
  weaken:       data => ({ name: 'weaken', value: data }),
  topic_id:     data => ({ name: 'topic_id', value: data }),
  type:         data => ({ name: 'type', value: data }),
  title:        data => ({ name: 'title', value: data }),
  content:      data => ({ name: 'content', value: data }),
  content_html: data => ({ name: 'content_html', value: data }),
  verify:       data => ({ name: 'verify', value: data }),
  recommend:    data => ({ name: 'recommend', value: data }),
  sort_by_date: data => ({ name: 'sort_by_date', value: data })
}

export default { queryList, updateList }
