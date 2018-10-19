import * as ParseParams from '../comment/parse-params';

// 查询
const query = {
  // 筛选条件
  filters: {
  },
  // 排序，page size，page number
  options: {
  }
}

// 储存
const save = {
  posts_id: data => ({
    name: 'posts_id',
    value: ParseParams.id(data),
    type: 'ID',
    desc:'帖子id'
  }),
  people_id: data => ({
    name: 'people_id',
    value: ParseParams.id(data),
    type: 'ID',
    desc:'用户id'
  }),
  comment_id: data => ({
    name: 'comment_id',
    value: ParseParams.id(data),
    type: 'ID',
    desc:'评论id'
  }),
  report_id: data => ({
    name: 'report_id',
    value: ParseParams.id(data),
    type: 'ID',
    desc:'评论id'
  }),
  detail: data => ({
    name: 'detail',
    value: data,
    type: 'String',
    desc:'详情'
  })
}

// 更新
const update = {
  // 筛选参数
  filters: {
  },
  // 更新内容
  content: {
  }
}

export default { query, save, update }
