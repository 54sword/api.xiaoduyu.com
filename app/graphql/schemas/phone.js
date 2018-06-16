
import { getQuerySchema, getUpdateSchema, getSaveSchema } from '../config';

exports.Schema = `

# 绑定手机号
type addPhone {
  success: Boolean
}



`

exports.Query = ``

exports.Mutation = `

# 绑定手机号
addPhone(${getSaveSchema('phone')}): addPhone

`

/*

# 更新手机号
type updatePhone {
  success: Boolean
}

# 更新手机号
# updatePhone(${getUpdateSchema('phone')}): updatePhone

 */
