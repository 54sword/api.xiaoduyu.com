
import { updatePassword } from './arguments'
import { getArguments } from '../tools'

export const Schema = `
  # 修改密码
  type updatePassword {
    # 结果
    success: Boolean
  }
`

export const Query = `
`

export const Mutation = `
  # 修改密码
  updatePassword(${getArguments(updatePassword)}): updatePassword
`
