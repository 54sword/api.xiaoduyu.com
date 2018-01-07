
export default (Schemas) => ({
  save: ({
    data = null,
    callback = ()=>{}
  }) => new Schemas(data).save(callback),

  // 查找一条数据
  findOne: ({
    query = {},
    select = {},
    callback = ()=>{}
  }) => Schemas.find(query, select).exec(callback),

  // 查询多个
  find: ({
    query = {},
    select = {},
    options = {},
    callback = ()=>{}
  }) => {
    let find = Schemas.find(query, select)
    for (let i in options) find[i](options[i])
    return find.exec(callback)
  },

  // 填充查询 - 基于 find 或 findOne 的结果，深入查询
  populate: ({
    collections = {},
    options = {},
    callback = ()=>{}
  }) => Schemas.populate(collections, options, callback),

  // 更新
  update: ({
    query = {},
    update = {},
    options = {},
    callback = ()=>{}
  }) => Schemas.update(query, update, options, callback),

  // 移除
  remove: ({
    query = {},
    callback = ()=>{}
  }) => Schemas.remove(query, callback)

})
