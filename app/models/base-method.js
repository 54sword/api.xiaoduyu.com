

export default (Schemas) => {

  let method = {}

  method.save = ({ data = null, callback = ()=>{} }) => {
    // if (!data) return callback(false)
    return new Schemas(data).save(callback)
  }

  method.find = ({ query = {}, select = {}, options = {}, callback = ()=>{} }) => {
    var find = Schemas.find(query, select)
    for (var i in options) find[i](options[i])
    return find.exec(callback)
  }

  method.findOne = ({ query = {}, select = {}, options = {}, callback = ()=>{} }) => {
    var find = Schemas.findOne(query, select)
    for (var i in options) find[i](options[i])
    return find.exec(callback)
  }

  method.update = ({ condition = {}, contents = {}, callback = ()=>{} }) => {
    return Schemas.update(condition, contents, callback)
  }

  method.remove = ({ condition = {}, callback = ()=>{} }) => {
    return Schemas.remove(condition, callback)
  }

  return method

}
