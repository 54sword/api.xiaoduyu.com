import * as ParseParams from '../common/parse-params';

// 查询
const query = {
  // 筛选条件
  filters: {
  },
  // 排序，page size，page number
  options: {}
}

// 储存
const save = {
  type: data => ({
    name: 'type',
    value: data,
    type: 'String',
    desc:'类型posts/comment/reply'
  }),
  target_id: data => ({
    name: 'target_id',
    value: ParseParams.id(data),
    type: 'String',
    desc:'目标类型的id'
  }),
  mood: data => ({
    name: 'mood',
    value: data,
    type: 'Int',
    desc:'心情：1是赞/2是踩'
  }),
  status: data => ({
    name: 'status',
    value: data,
    type: 'Boolean',
    desc:'状态'
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
