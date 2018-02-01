
import posts from './posts'

let list = {
  posts
}

export default (args, name) => {

  let { queryList, optionList, updateList } = list[name]

  let query = {},
      options = {},
      update = {}

  for (let i in args) {
    if (queryList[i]) {
      let result = queryList[i](args[i])
      query[result.name] = result.value
    }
  }

  for (let i in args) {
    if (optionList[i]) {
      let result = optionList[i](args[i])
      options[result.name] = result.value
    }
  }

  // limit默认值
  if (!options.limit) options.limit = 30
  // limit 最大值
  else if (options.limit > 300) options.limit = 300

  if (!options.skip) {
    options.skip = 0
  } else {
    options.skip = options.skip * options.limit
  }

  // 更新字段查询
  for (let i in args) {
    if (updateList[i]) {
      let result = updateList[i](args[i])
      update[result.name] = result.value
    }
  }

  return { query, options, update }

}
