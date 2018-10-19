
exports.Schema = `

  # 使用旧的token，兑换新的token
  type exchangeNewToken {
    # 新的token
    access_token: String
    # 新token的有效日期
    expires: String
  }

`

exports.Query = `
`

exports.Mutation = `
  # 使用旧的token，兑换新的token
  exchangeNewToken(token:String!): exchangeNewToken
`
