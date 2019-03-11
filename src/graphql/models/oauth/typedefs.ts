
export const Schema = `

# 取消绑定
type oAuthUnbinding {
  success: Boolean
}

`

export const Query = `

`

export const Mutation = `

# 取消绑定
oAuthUnbinding(name:String!): oAuthUnbinding

`
