// query 参数白名单，以及监测参数是否合法
const queryWhiteList = {
  _id: data => ({ name: '_id', value: data }),
  user_id: data => ({ name: 'user_id', value: data }),
  deleted: data => {
    let obj = { name: 'deleted', value: data }
    if (typeof data != 'boolean') obj.err = 90000
    return obj
  },
  weaken: data => {
    let obj = { name: 'weaken', value: data }
    if (typeof data != 'boolean') obj.err = 90000
    return obj
  },
  topic_id: data => ({ name: 'topic_id', value: data }),
  type: data => ({ name: 'type', value: data }),
  title: data => ({ name: 'title', value: data }),
  content: data => ({ name: 'content', value: data }),
  content_html: data => ({ name: 'content_html', value: data }),
  verify: data => ({ name: 'verify', value: data }),
  recommend: data => {
    let obj = { name: 'recommend', value: data }
    if (typeof data != 'boolean') obj.err = 90000
    return obj
  },
  sort_by_date: data => ({ name: 'sort_by_date', value: data }),
  // 小于
  lt_create_at: data => ({ name: 'create_at', value: { '$lt': data } }),
  // 小于等于
  lte_create_at: data => ({ name: 'create_at', value: { '$lte': data } }),
  // 大于
  gt_create_at: data => ({ name: 'create_at', value: { '$gt': data } }),
  // 大于等于
  gte_create_at: data => ({ name: 'create_at', value: { '$gte': data } })
}

const selectWhiteList = [
  "__v", "_id", "comments", "comments_count", "last_comment_at",
  "topic_id", "user_id", "sort_by_date", "weaken", "recommend", "verify", "deleted",
  "ip", "device", "like_count", "follow_count", "view_count", "comment_count", "comment",
  "create_at", "content_html", "content", "title", "type"
]

const optionsWhiteList = {
  skip: data => ({ name: 'skip', value: parseInt(data) }),
  limit: data => ({ name: 'limit', value: parseInt(data) }),
  sort: data => ({ name: 'sort', value: data })
}

const typeCheck = (name, value, type) => {
  if (typeof value != type) {
    return { error: 90000, error_data: { type } }
  } else {
    return { name, value }
  }
}

// [白名单]允许修改的字段
const updateWhiteList = {
  deleted:      data => { return typeCheck('deleted', data, 'boolean') },
  weaken:       data => { return typeCheck('weaken', data, 'boolean') },
  topic_id:     data => { return typeCheck('topic_id', data, 'string') },
  type:         data => { return typeCheck('type', data, 'number') },
  title:        data => { return typeCheck('title', data, 'string') },
  content:      data => { return typeCheck('content', data, 'string') },
  content_html: data => { return typeCheck('content_html', data, 'string') },
  verify:       data => { return typeCheck('verify', data, 'boolean') },
  recommend:    data => { return typeCheck('recommend', data, 'boolean') },
  sort_by_date: data => { return typeCheck('sort_by_date', data, 'number') }
}

export default { queryWhiteList, selectWhiteList, optionsWhiteList, updateWhiteList }
