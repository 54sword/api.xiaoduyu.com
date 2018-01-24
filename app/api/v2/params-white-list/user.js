// query 参数白名单，以及监测参数是否合法
const queryWhiteList = {
  _id: data => ({ name: '_id', value: data }),
  nickname: data => ({ name: 'nickname', value: data }),
  blocked: data => ({ name: 'blocked', value: data }),
  banned_to_post: data => ({ name: 'banned_to_post', value: data }),
  avatar: data => ({ name: 'avatar', value: data }),
  gender: data => ({ name: 'gender', value: data }),
  brief: data => ({ name: 'brief', value: data }),
  password: data => ({ name: 'password', value: data })
}

const selectWhiteList = [
  // "__v",
  "_id", "nickname", "nickname_reset_at", "create_at", "last_sign_at", "blocked",
  "banned_to_post", "avatar", "gender", "brief", "source", "posts_count", "comment_count",
  "comment_count", "fans_count", "like_count", "follow_people_count",
  "follow_topic_count", "follow_posts_count"
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
  nickname: data => typeCheck('nickname', data, 'boolean'),
  blocked: data => typeCheck('blocked', data, 'boolean'),
  banned_to_post: data => typeCheck('banned_to_post', data, 'number'),
  avatar: data => typeCheck('avatar', data, 'string'),
  gender: data => typeCheck('gender', data, 'number'),
  brief: data => typeCheck('brief', data, 'string'),
  password: data => typeCheck('password', data, 'boolean')
}

const saveWhiteList = {}

export default { saveWhiteList, queryWhiteList, selectWhiteList, optionsWhiteList, updateWhiteList }
