// query 参数白名单，以及监测参数是否合法
const queryList = {
  _id: data => ({ name: '_id', value: data }),
  blocked: data => ({ name: 'deleted', value: data }),
  end_create_at: data => ({ name: 'create_at', value: { '$lte': data } }),
  start_create_at: data => ({ name: 'create_at', value: { '$gte': data } }),
  banned_to_post: data => ({ name: 'banned_to_post', value: { '$gte': new Date() } })
}

const optionList = {
  page_number: data => ({ name: 'skip', value: data - 1 >= 0 ? data - 1 : 0 }),
  page_size: data => ({ name: 'limit', value: data }),
  sort_by: data => {

    let value = {}
    value[data] = -1

    return ({ name: 'sort', value })
  }
}

export default { queryList, optionList }
