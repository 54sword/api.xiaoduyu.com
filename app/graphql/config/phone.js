
// 查询
const query = {
  // 筛选条件
  filters: {},
  // 排序，page size，page number
  options: {}
}

// 储存
const save = {
  phone: data => ({
    name: 'phone', value: data,
    type: 'String', desc:'手机'
  }),
  area_code: data => ({
    name: 'area_code', value: data,
    type: 'String', desc:'手机国家代码'
  }),
  captcha: data => ({
    name: 'captcha', value: data,
    type: 'String!', desc:'验证码'
  })
}

// 更新
const update = {
  // 筛选参数
  filters: {},
  // 更新内容
  content: {}
}

export default { query, save, update }
