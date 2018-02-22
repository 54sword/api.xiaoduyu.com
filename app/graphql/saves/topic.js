// query 参数白名单，以及监测参数是否合法
const saveList = {
  name: data => ({
    name: 'name', value: data, role: 'admin',
    type: 'String!', desc:'名称'
  }),
  brief: data => ({
    name: 'brief', value: data, role: 'admin',
    type: 'String!', desc:'简介'
  }),
  description: data => ({
    name: 'description', value: data, role: 'admin',
    type: 'String!', desc:'描述'
  }),
  avatar: data => ({
    name: 'avatar', value: data, role: 'admin',
    type: 'String!', desc:'头像url地址'
  }),
  background: data => ({
    name: 'background', value: data, role: 'admin',
    type: 'String', desc:'背景图片'
  }),
  sort: data => ({
    name: 'sort', value: data, role: 'admin',
    type: 'Int', desc:'排序'
  }),
  recommend: data => ({
    name: 'recommend', value: data, role: 'admin',
    type: 'Boolean', desc:'推荐'
  }),
  parent_id: data => ({
    name: 'parent_id', value: data, role: 'admin',
    type: 'ID', desc:'父类ID'
  })
}

export default { saveList }
