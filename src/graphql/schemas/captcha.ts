
import { getQuerySchema, getUpdateSchema, getSaveSchema } from '../config';

export const Schema = `

  # 返回图片验证码
  type captchaImg {
    success: Boolean
    _id: String
    url: String
  }

  # 获取验证码
  type captcha {
    captcha: String
  }
`

export const Query = `
  # 获取验证码【此API测试环境有效】
  getCaptcha(_id:ID, phone:String, email:String): captcha
`

export const Mutation = `
  # 创建验证码
  addCaptcha(${getSaveSchema('captcha')}): captchaImg
`
