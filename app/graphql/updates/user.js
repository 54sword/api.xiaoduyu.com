// query 参数白名单，以及监测参数是否合法
const queryList = {
  _id: data => ({ name: '_id', value: data })
}

const updateList = {
  blocked:              data => ({ name: 'blocked',             value: data, role: 'admin' }),
  banned_to_post:       data => ({ name: 'banned_to_post',      value: data, role: 'admin' }),
  avatar:               data => ({ name: 'avatar',              value: data }),
  brief:                data => ({ name: 'brief',               value: data }),
  gender:               data => ({ name: 'gender',              value: data }),
  nickname:             data => ({ name: 'nickname',            value: data })
}

export default { queryList, updateList }
