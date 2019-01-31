

import { getQuerySchema, getUpdateSchema, getSaveSchema } from '../config';


export const Schema = `
  type like {
    success: Boolean
  }
`

export const Query = `
`

export const Mutation = `
  # 赞
  like(${getSaveSchema('like')}): like
`
