
// 查询
const query = {
  // 筛选条件
  filters: {},
  // 排序，page size，page number
  options: {}
}

// 储存
const save = {
  email: data => ({
    name: 'email', value: data,
    type: 'String', desc:'邮箱[email]'
  }),
  phone: data => ({
    name: 'phone', value: data,
    type: 'String', desc:'手机[phone]'
  }),
  area_code: data => ({
    name: 'area_code', value: data,
    type: 'String', desc:'手机国家代码[phone]'
  }),
  type: data => ({
    name: 'type', value: data,
    type: 'String!', desc:'类型 - sign-in、binding-email、reset-email、sign-up、forgot、binding-phone、reset-phone'
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
