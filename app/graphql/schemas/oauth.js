
exports.Schema = `

  # 取消绑定
  type oAuthUnbinding {
    success: Boolean
  }

`

exports.Query = `

`

exports.Mutation = `

  # 取消绑定
  oAuthUnbinding(name:String!): oAuthUnbinding

`
