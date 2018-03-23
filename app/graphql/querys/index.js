
import posts from './posts'
import topic from './topic'
import user from './user'
import comment from './comment'
import userNotification from './user-notification'
import notification from './notification'
import account from './account'
// import analysis from './analysis'

let list = {
  posts, topic, user, comment,
  'user-notification': userNotification,
  notification, account
}

export default ({ args = {}, model, role = '' }) => {

  let { queryList, optionList } = list[model];

  let query = {}, options = {}, querySchema = ``;

  for (let i in args) {
    if (queryList[i]) {
      let result = queryList[i](args[i])
      if (result.role && role != result.role) continue
      if (result.name) {
        if (typeof result.value == 'object') {

          if (!query[result.name]) query[result.name] = {};

          for (let n in result.value) {
            query[result.name][n] = result.value[n]
          }
        } else {
          query[result.name] = result.value
        }
      }
    }
  }

  console.log(query);

  for (let i in args) {
    if (optionList[i]) {
      let result = optionList[i](args[i])
      if (result.role && role != result.role) continue
      if (result.name) options[result.name] = result.value
    }
  }

  // limit默认值
  if (!options.limit) options.limit = 30
  // limit 最大值
  else if (options.limit > 300) options.limit = 300

  options.skip = !options.skip ? 0 : options.skip * options.limit

  // 生成 query schema

  for (let i in queryList) {
    querySchema += `
      #${queryList[i]().desc}${queryList[i]().role == 'admin' ? ' (管理员)' : ''}
      ${i}:${queryList[i]().type}
    `
  }

  for (let i in optionList) {
    querySchema += `
      #${optionList[i]().desc}
      ${i}:${optionList[i]().type}
    `
  }

  return { query, options, querySchema }

}
