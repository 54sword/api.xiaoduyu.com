// query 参数白名单，以及监测参数是否合法
const queryList = {
  start_create_at: data => ({ name: 'create_at', value: { '$gte': data } }),
  end_create_at: data => ({ name: 'create_at', value: { '$lte': data } })
}

const optionList = {}

export default { queryList, optionList }
