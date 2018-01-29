
import posts from './posts'

let list = {
  posts
}

export default (args, name) => {

  let { queryList, optionList } = list[name]

  let query = {},
      options = {}

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

  if (!options.skip) options.skip = 0


  /*


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

  console.log(query);
  console.log(options);

  return { query, options }

}
