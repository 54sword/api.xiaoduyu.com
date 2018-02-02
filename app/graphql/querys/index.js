
import posts from './posts'
import topic from './topic'

let list = {
  posts, topic
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

  options.skip = !options.skip ? 0 : options.skip * options.limit

  return { query, options }

}
