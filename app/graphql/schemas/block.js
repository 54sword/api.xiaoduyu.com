


exports.Schema = `

  type blocks {
    success: Boolean
  }

  type addBlock {
    success: Boolean
  }

  type removeBlock {
    success: Boolean
  }

`

exports.Query = `

  # 登录前先通过，captcha API，获取验证码，如果有返回验证码图片，则将其显示给用户
  blocks(
    people_exsits: Boolean
    posts_exsits: Boolean
    page_size: Int
    page_number: Int
  ): blocks

`

exports.Mutation = `

  addBlock(
    posts_id: ID
    user_id: ID
  ): addBlock

  removeBlock(
    posts_id: ID
    user_id: ID
  ): removeBlock

`
