
import { getQuerySchema, getUpdateSchema, getSaveSchema } from '../config';

exports.Schema = `

# 返回验证码结果
type captcha {
  success: Boolean
  _id: String
  url: String
}

`

exports.Query = `
`

exports.Mutation = `
  # 创建验证码
  addCaptcha(${getSaveSchema('captcha')}): captcha
`
