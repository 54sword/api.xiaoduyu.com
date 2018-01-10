// query 参数白名单，以及监测参数是否合法
const queryWhiteList = {
  _id: data => ({ name: '_id', value: data }),
  parent_id: data => ({ name: 'parent_id', value: data }),
  user_id: data => ({ name: 'user_id', value: data }),
  name: data => ({ name: 'name', value: data }),
  brief: data => ({ name: 'brief', value: data }),
  description: data => ({ name: 'description', value: data }),
  avatar: data => ({ name: 'avatar', value: data }),
  background: data => ({ name: 'background', value: data }),
  follow_count: data => ({ name: 'follow_count', value: data }),
  posts_count: data => ({ name: 'posts_count', value: data }),
  comment_count: data => ({ name: 'comment_count', value: data }),
  sort: data => ({ name: 'sort', value: data }),
  language: data => ({ name: 'language', value: data }),
  recommend: data => ({ name: 'recommend', value: data }),

  // 表外字段
  people_id: data => ({ name: 'people_id', value: data })
}

const selectWhiteList = [
  "__v", "_id", "user_id", "parent_id", "name", "description", "avatar",
  "background", "follow_count", "posts_count", "comment_count", "sort",
  "create_at", "language", "recommend", "brief"
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
  parent_id:   data => typeCheck('parent_id', data, 'string'),
  name:        data => typeCheck('name', data, 'string'),
  brief:       data => typeCheck('brief', data, 'string'),
  description: data => typeCheck('description', data, 'string'),
  avatar:      data => typeCheck('avatar', data, 'string'),
  background:  data => typeCheck('background', data, 'string'),
  recommend:   data => typeCheck('recommend', data, 'boolean'),
  sort:        data => typeCheck('sort', data, 'number'),
  language:    data => typeCheck('language', data, 'number'),
  recommend:   data => typeCheck('recommend', data, 'boolean')
}

// 储存字段白名单
const saveWhiteList = {
  name:        data => typeCheck('name', data, 'string'),
  brief:       data => typeCheck('brief', data, 'string'),
  avatar:      data => typeCheck('avatar', data, 'string'),
  description: data => typeCheck('description', data, 'string'),
  user_id:     data => typeCheck('user_id', data, 'string'),
  parent_id:   data => typeCheck('parent_id', data, 'string')
}


export default { saveWhiteList, queryWhiteList, selectWhiteList, optionsWhiteList, updateWhiteList }
