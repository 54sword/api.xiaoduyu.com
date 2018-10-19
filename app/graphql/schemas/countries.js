
exports.Schema = `

  type countries {
    # 国家手机区号代码
    code: String
    # 名称
    name: String
    # 国家英文缩写
    abbr: String
  }

`

exports.Query = `

  # 获取国家
  countries: [countries]

`

exports.Mutation = `

`
