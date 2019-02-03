
import { getQuerySchema, getUpdateSchema, getSaveSchema } from '../config';

export const Schema = `

  # 绑定手机号
  type addPhone {
    success: Boolean
  }

`

export const Query = ``

export const Mutation = `

  # 绑定手机号
  addPhone(${getSaveSchema('phone')}): addPhone

`
