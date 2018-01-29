
import posts from './posts'

// console.log(posts);

let list = {
  posts
}

export default (args, name) => {

  // console.log(dataJSON);

  let { queryList, optionList } = list[name]

  // console.log(querys);

  let query = {},
      options = {}

  for (let i in args) {
    if (args[i]) {
      let result = queryList[i](args[i])
      query[result.name] = result.value
    }
  }

  for (let i in args) {
    if (args[i]) {
      let result = optionList[i](args[i])
      query[result.name] = result.value
    }
  }

  // console.log(query);

  /*
  // limit默认值
  if (!options.limit) options.limit = 30
  // limit 最大值
  else if (options.limit > 300) options.limit = 300

  for (let i in updateJSON) {
    if (updateWhiteList[i]) {
      let result = updateWhiteList[i](updateJSON[i])
      if (result && result.error) {
        result.success = false
        return result
      } else {
        update[result.name] = result.value
      }
    }
  }
  */

  return { query, options }

}
