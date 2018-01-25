// query 参数白名单，以及监测参数是否合法
const queryWhiteList = {
  _id: data => ({ name: '_id', value: data }),
  type: data => ({ name: 'type', value: data }),
  sender_id: data => ({ name: 'sender_id', value: data }),
  addressee_id: data => ({ name: 'addressee_id', value: data }),
  posts_id: data => ({ name: 'posts_id', value: data }),
  comment_id: data => ({ name: 'comment_id', value: data }),
  has_read: data => ({ name: 'has_read', value: data }),
  deleted: data => ({ name: 'deleted', value: data }),
  create_at: data => ({ name: 'create_at', value: data })
}

const selectWhiteList = [
  // "__v",
  "_id", "type", "sender_id", "addressee_id",
  "posts_id", "comment_id", "has_read", "deleted",
  "create_at"
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
  deleted: data => typeCheck('deleted', data, 'boolean'),
  create_at: data => typeCheck('create_at', data, 'boolean')
}

const saveWhiteList = {}

export default { saveWhiteList, queryWhiteList, selectWhiteList, optionsWhiteList, updateWhiteList }
