
import { getQuerySchema, getUpdateSchema, getSaveSchema } from '../config';

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
  updatePassword(${getUpdateSchema('password')}): updatePassword

`
