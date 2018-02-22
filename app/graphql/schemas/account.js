
import Query from '../querys'
const { querySchema } = Query({ model: 'account' })

exports.Schema = `

# 登录
type signIn {
  user_id: ID
  access_token: String
}

`

exports.Query = `

# 登录前先通过，captcha API，获取验证码，如果有返回验证码图片，则将其显示给用户
signIn(${querySchema}): signIn

`

exports.Mutation = `
`
