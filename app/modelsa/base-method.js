
export default (Schemas) => ({

  save: ({
    data = null,
    callback = ()=>{}
  }) => {
    return new Promise((resolve, reject) => {
      new Schemas(data).save((err, res)=>{
        err ? reject(err) : resolve(res)
      })
    })
  },

  // 查找一条数据
  findOne: ({
    query = {},
    select = {},
    options = {},
    callback = ()=>{}
  }) => {
    return new Promise((resolve, reject) => {
      let find = Schemas.findOne(query, select)
      for (let i in options) find[i](options[i])
      find.exec((err, res)=>{
        err ? reject(err) : resolve(res)
      })
    })
  },

  // 查询多个
  find: ({
    query = {},
    select = {},
    options = {},
    callback = ()=>{}
  }) => {
    return new Promise((resolve, reject) => {
      let find = Schemas.find(query, select)
      for (let i in options) find[i](options[i])
      find.exec((err, res)=>{
        err ? reject(err) : resolve(res)
      })
    })
  },

  // 填充查询 - 基于 find 或 findOne 的结果，深入查询
  populate: ({
    collections = {},
    options = {},
    callback = ()=>{}
  }) => {
    return new Promise((resolve, reject) => {
      Schemas.populate(collections, options, (err, res)=>{
        err ? reject(err) : resolve(res)
      })
    })
  },

  // 更新
  update: ({
    query = {},
    update = {},
    options = {},
    callback = ()=>{}
  }) => {
    return new Promise((resolve, reject) => {
      Schemas.update(query, update, options, (err, res)=>{
        err ? reject(err) : resolve(res)
      })
    })
  },

  // 移除
  remove: ({
    query = {},
    callback = ()=>{}
  }) => {
    return new Promise((resolve, reject) => {
      Schemas.remove(query, (err, res)=>{
        err ? reject(err) : resolve(res)
      })
    })
  },

  // 查询文档数量
  count: ({
    query = {},
    callback = ()=>{}
  }) => {
    return new Promise((resolve, reject) => {
      Schemas.count(query, (err, res)=>{
        err ? reject(err) : resolve(res)
      })
    })
  }

})
