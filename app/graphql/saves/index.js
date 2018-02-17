
import topic from './topic'

let list = {
  topic
}

export default ({ args = {}, model, role = '' }) => {

  let { saveList } = list[model]

  let save = {}, saveSchema = ``;

  for (let i in args) {
    if (saveList[i]) {
      let result = saveList[i](args[i])
      if (role && result.role && role != result.role) continue
      if (result.name) save[result.name] = result.value
    }
  }

  for (let i in saveList) {
    saveSchema += `
      # ${saveList[i]().desc}
      # ${saveList[i]().role == 'admin' ? '(管理员)' : ''}
      ${i}:${saveList[i]().type}
    `
  }

  return { save, saveSchema }

}
