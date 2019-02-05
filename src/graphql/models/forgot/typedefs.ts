
import { forgot } from './arguments'
import { getArguments } from '../tools'

export const Schema = `
  # 忘记密码
  type forgot {
    success: Boolean
  }
`

export const Query = `
`

export const Mutation = `
  # 忘记密码
  forgot(${getArguments(forgot)}): forgot
`
