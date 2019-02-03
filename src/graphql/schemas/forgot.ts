
import { getQuerySchema, getUpdateSchema, getSaveSchema } from '../config';

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
  forgot(${getUpdateSchema('forgot')}): forgot
`
