exports.Schema = `

# 登录
type signIn {
  user_id: ID
  access_token: String
}

`

exports.Query = `

# 登录
signIn(
  email: String
  phone: String
  password: String!
  captcha: String
  captcha_id: String
): signIn

`

exports.Mutation = `
`
