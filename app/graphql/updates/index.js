
import posts from './posts'

let list = {
  posts
}

export default (args, name) => {

  let { queryList, updateList } = list[name]

  let query = {},
      update = {}

  for (let i in args) {
    if (queryList[i]) {
      let result = queryList[i](args[i])
      query[result.name] = result.value
    }
  }

  // 更新字段查询
  for (let i in args) {
    if (updateList[i]) {
      let result = updateList[i](args[i])
      update[result.name] = result.value
    }
  }

  return { query, update }

}
