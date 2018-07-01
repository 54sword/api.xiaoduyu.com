
import { getQuerySchema, getUpdateSchema, getSaveSchema } from '../config';

exports.Schema = `
  # 忘记密码
  type forgot {
    success: Boolean
  }
`

exports.Query = `
`

exports.Mutation = `
  # 忘记密码
  forgot(${getUpdateSchema('forgot')}): forgot
`
