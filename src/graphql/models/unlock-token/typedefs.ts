
export const Schema = `
# 解锁的token
type unlockToken {
  unlock_token: String
}
`

export const Query = `
# 获取解锁的token，用于修改手机号、邮箱地址
getUnlockToken(
  # 类型 - phone、email
  type:String!,
  captcha:String!
): unlockToken
`

export const Mutation = ``
