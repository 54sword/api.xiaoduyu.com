
export const Schema = `
  type countries {
    # 国家手机区号代码
    code: String
    # 名称
    name: String
    # 国家英文缩写
    abbr: String
  }
`

export const Query = `
  # 获取国家
  countries: [countries]
`

export const Mutation = ``