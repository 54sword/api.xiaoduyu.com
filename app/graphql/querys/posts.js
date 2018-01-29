// query 参数白名单，以及监测参数是否合法
const queryList = {
  _id: data => ({ name: '_id', value: data }),
  user_id: data => ({ name: 'user_id', value: data }),
  deleted: data => ({ name: 'deleted', value: data }),
  weaken: data => ({ name: 'weaken', value: data }),
  topic_id: data => ({ name: 'topic_id', value: data }),
  type: data => ({ name: 'type', value: data }),
  title: data => ({ name: 'title', value: data }),
  content: data => ({ name: 'content', value: data }),
  content_html: data => ({ name: 'content_html', value: data }),
  verify: data => ({ name: 'verify', value: data }),
  recommend: data => ({ name: 'recommend', value: data }),
  sort_by_date: data => ({ name: 'sort_by_date', value: data }),
  create_at: data => {
    let obj = {}

    if (typeof data != 'object') return { error: 90000 }

    // 小于
    if (data['$lt']) obj['$lt'] = data['$lt']
    // 小于等于
    if (data['$lte']) obj['$lte'] = data['$lte']
    // 大于
    if (data['$gt']) obj['$gt'] = data['$gt']
    // 大于等于
    if (data['$gte']) obj['$gte'] = data['$gte']

    if (Reflect.ownKeys(obj).length == 0) return { error: 90000 }

    return { name: 'create_at', value: obj }
  }
}

const optionList = {}

export default { queryList, optionList }
