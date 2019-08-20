
import { getCaptcha, addCaptcha } from './arguments'
import { getArguments } from '../tools'

export const Schema = `

  "返回图片验证码，如果没有，则表示无需验证验证码"
  type captchaImg {
    success: Boolean
    _id: String
    url: String
  }

  "获取验证码"
  type captcha {
    captcha: String
  }
`

export const Query = `
  "获取验证码【此API测试环境有效】"
  getCaptcha(${getArguments(getCaptcha)}): captcha @cacheControl(maxAge: 0)
`

export const Mutation = `
  "创建验证码"
  addCaptcha(${getArguments(addCaptcha)}): captchaImg
`
