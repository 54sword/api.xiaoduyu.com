

import { getQuerySchema, getUpdateSchema, getSaveSchema } from '../config';


exports.Schema = `
  type like {
    success: Boolean
  }
`

exports.Query = `
`

exports.Mutation = `
  # 赞
  like(${getSaveSchema('like')}): like
`
