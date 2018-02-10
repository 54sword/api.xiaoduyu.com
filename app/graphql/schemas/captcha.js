exports.Schema = `

# 返回验证码id
type captcha {
  _id: String
  url: String
}

`

exports.Query = `

# 获取验证码id
captcha: captcha

`

exports.Mutation = `
`
