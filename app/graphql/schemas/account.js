
import { getQuerySchema } from '../config'

exports.Schema = `

  # 登录
  type signIn {
    user_id: ID
    access_token: String
  }
  
  type signUp {
    success: Boolean
  }

  type sendCaptchaToEmail {
    success: Boolean
  }

  type bindingEmail {
    success: Boolean
  }

  type resetPasswordByCaptcha {
    success: Boolean
  }

  type resetEmail {
    success: Boolean
  }

  type checkEmailAndSendCaptcha {
    success: Boolean
  }

`

exports.Query = `

  # 登录前先通过，captcha API，获取验证码，如果有返回验证码图片，则将其显示给用户
  signIn(${getQuerySchema('account')}): signIn

`

exports.Mutation = `

  # 注册
  signUp(
    nickname: String!
    email: String
    area_code: String
    phone: String
    password: String!
    source: Int = 0
    captcha: String
    gender: Int
  ): signUp

  # 发送验证码到邮箱
  sendCaptchaToEmail(
    email: String!
  ): sendCaptchaToEmail

  # 绑定邮箱
  bindingEmail(
    email: String!
    captcha: String!
  ): bindingEmail

  # 通过验证码修改密码
  resetPasswordByCaptcha(
    email: String!
    new_password: String!
    captcha: String!
  ): resetPasswordByCaptcha

  # 修改邮箱
  resetEmail(
    email: String!
    captcha: String!
  ): resetEmail

  # 检测新邮箱，邮箱地址正确，则发送验证码
  checkEmailAndSendCaptcha(
    email: String!
  ): checkEmailAndSendCaptcha

`
