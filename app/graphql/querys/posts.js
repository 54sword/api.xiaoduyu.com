// query 参数白名单，以及监测参数是否合法
const queryList = {
  _id: data => ({ name: '_id', value: data }),
  user_id: data => ({ name: 'user_id', value: data }),
  topic_id: data => ({ name: 'topic_id', value: data }),
  title: data => ({ name: 'title', value: data }),

  deleted: data => ({ name: 'deleted', value: data }),
  weaken: data => ({ name: 'weaken', value: data }),
  recommend: data => ({ name: 'recommend', value: data }),

  start_create_at: data => ({ name: 'create_at', value: { '$gte': data } }),
  end_create_at: data => ({ name: 'create_at', value: { '$lte': data } }),
}

const optionList = {
  skip: data => ({ name: 'skip', value: data }),
  limit: data => ({ name: 'limit', value: data })
}

export default { queryList, optionList }
