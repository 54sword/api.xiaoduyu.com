// query 参数白名单，以及监测参数是否合法
const queryList = {
  _id: data => ({
    name: '_id', value: data,
    type: 'ID!', desc:'ID'
  })
}

const updateList = {
  blocked: data => ({
    name: 'blocked', value: data, role: 'admin',
    type: 'Boolean', desc:'屏蔽用户'
  }),
  banned_to_post: data => ({
    name: 'banned_to_post', value: data, role: 'admin',
    type: 'String', desc:'禁言时间'
  }),
  avatar: data => ({
    name: 'avatar', value: data,
    type: 'String', desc:'头像'
  }),
  brief: data => ({
    name: 'brief', value: data,
    type: 'String', desc:'一句话自我介绍'
  }),
  gender: data => ({
    name: 'gender', value: data,
    type: 'Int', desc:'性别'
  }),
  nickname: data => ({
    name: 'nickname', value: data,
    type: 'String', desc:'昵称'
  })
}

export default { queryList, updateList }
