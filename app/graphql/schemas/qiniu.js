
exports.Schema = `

  # 话题
  type qiniuToken {
    token: String
    url: String
  }

`

exports.Query = `

  # 查询帖子
  qiniuToken: qiniuToken

`

exports.Mutation = `
`
