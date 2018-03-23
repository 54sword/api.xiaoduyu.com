

import { getQuerySchema, getUpdateSchema, getSaveSchema } from '../config';


exports.Schema = `
  type like {
    success: Boolean
  }
`

exports.Query = `
`

exports.Mutation = `
  like(${getSaveSchema('like')}): like
`
