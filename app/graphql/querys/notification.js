// query 参数白名单，以及监测参数是否合法
const queryList = {
  _id: data => ({ name: '_id', value: data }),
  sender_id: data => ({ name: 'sender_id', value: data }),
  addressee_id: data => ({ name: 'addressee_id', value: data }),
  deleted: data => ({ name: 'deleted', value: data }),
  type: data => ({ name: 'type', value: data }),
  end_create_at: data => ({ name: 'create_at', value: { '$lte': data } }),
  start_create_at: data => ({ name: 'create_at', value: { '$gte': data } })
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
