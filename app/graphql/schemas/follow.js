

import { getQuerySchema, getUpdateSchema, getSaveSchema } from '../config';


exports.Schema = `
  # 添加关注
  type addFollow {
    success: Boolean
  }
`

exports.Query = `
`

exports.Mutation = `
  addFollow(${getSaveSchema('follow')}): addFollow
`
