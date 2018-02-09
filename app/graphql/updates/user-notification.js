// query 参数白名单，以及监测参数是否合法
const queryList = {
  _id: data => ({ name: '_id', value: data })
}

const updateList = {
  deleted:              data => ({ name: 'deleted',             value: data, role: 'admin' })
}

export default { queryList, updateList }
