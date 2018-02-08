// query 参数白名单，以及监测参数是否合法
const queryList = {
  _id: data => ({ name: '_id', value: data })
}

const updateList = {
  deleted:      data => ({ name: 'deleted',      value: data, role: 'admin' }),
  weaken:       data => ({ name: 'weaken',       value: data, role: 'admin' }),
  // content:      data => ({ name: 'content',      value: data }),
  // content_html: data => ({ name: 'content_html', value: data }),
  recommend:    data => ({ name: 'recommend',    value: data, role: 'admin' })
}

export default { queryList, updateList }
