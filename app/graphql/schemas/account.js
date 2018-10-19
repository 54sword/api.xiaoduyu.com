
import { getQuerySchema, getSaveSchema } from '../config'

exports.Schema = `

  # 登录
  type signIn {
    # 用户id
    user_id: ID
    # 访问token
    access_token: String
    # token有效日期
    expires: String
  }

  # 绑定邮箱
  type addEmail {
    success: Boolean
  }

`

exports.Query = `

  # 登录前先通过，captcha API，获取验证码，如果有返回验证码图片，则将其显示给用户
  signIn(${getQuerySchema('account')}): signIn

`

exports.Mutation = `

  # 绑定邮箱和修改邮箱
  addEmail(${getSaveSchema('account')}): addEmail

`
