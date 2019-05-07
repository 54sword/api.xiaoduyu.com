import { getArguments } from '../tools'
import { QQOAuth } from './arguments'

export const Schema = `

# 取消绑定
type oAuthUnbinding {
  success: Boolean
}

# 登陆&注册、绑定（绑定账号需要在headers中附带access_token）
type QQOAuth {
  success: Boolean
  access_token: String
  expires: Int
}

`

export const Query = `

`

export const Mutation = `

oAuthUnbinding(name:String!): oAuthUnbinding

QQOAuth(${getArguments(QQOAuth)}): QQOAuth

`
