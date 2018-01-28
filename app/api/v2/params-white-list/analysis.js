// query 参数白名单，以及监测参数是否合法
const queryWhiteList = {
  create_at: data => ({ name: 'create_at', value: data })
}

const selectWhiteList = []

const optionsWhiteList = {
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
}


const saveWhiteList = {}

export default { saveWhiteList, queryWhiteList, selectWhiteList, optionsWhiteList, updateWhiteList }
