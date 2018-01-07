// query 参数白名单，以及监测参数是否合法
const queryWhiteList = {
  _id: data => ({ name: '_id', value: data }),
  posts_id: data => ({ name: 'posts_id', value: data }),
  parent_id: data => ({ name: 'parent_id', value: data }),
  reply_id: data => ({ name: 'reply_id', value: data }),
  content: data => ({ name: 'content', value: data }),
  content_html: data => ({ name: 'content_html', value: data }),
  create_at: data => ({ name: 'create_at', value: data }),
  update_at: data => ({ name: 'update_at', value: data }),
  last_reply_at: data => ({ name: 'last_reply_at', value: data }),
  reply_count: data => ({ name: 'reply_count', value: data }),
  reply: data => ({ name: 'reply', value: data }),
  like_count: data => ({ name: 'like_count', value: data }),
  device: data => ({ name: 'device', value: data }),
  ip: data => ({ name: 'ip', value: data }),
  blocked: data => ({ name: 'blocked', value: data }),
  deleted: data => ({ name: 'deleted', value: data }),
  verify: data => ({ name: 'verify', value: data }),
  weaken: data => ({ name: 'weaken', value: data }),

  // 表外字段
  people_id: data => ({ name: 'people_id', value: data })
}

const selectWhiteList = [
  "__v", "_id", "user_id", "posts_id", "parent_id", "reply_id", "content", "content_html",
  "create_at", "update_at", "last_reply_at", "reply_count", "reply", "like_count", "device",
  "ip", "blocked", "deleted", "verify", "weaken"
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
  reply_id:     data => typeCheck('reply_id', data, 'string'),
  content:      data => typeCheck('content', data, 'string'),
  content_html: data => typeCheck('content_html', data, 'string'),
  update_at:    data => typeCheck('update_at', data, 'number'),
  blocked:      data => typeCheck('blocked', data, 'boolean'),
  deleted:      data => typeCheck('deleted', data, 'boolean'),
  verify:       data => typeCheck('verify', data, 'boolean'),
  weaken:       data => typeCheck('weaken', data, 'boolean'),
}


export default { queryWhiteList, selectWhiteList, optionsWhiteList, updateWhiteList }
