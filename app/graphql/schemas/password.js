
import { getQuerySchema, getUpdateSchema, getSaveSchema } from '../config';

exports.Schema = `

# 修改密码
type updatePassword {
  # 结果
  success: Boolean
}

`

exports.Query = `

`

exports.Mutation = `

# 修改密码
updatePassword(${getUpdateSchema('password')}): updatePassword

`
