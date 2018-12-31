import * as ParseParams from '../common/parse-params';

// 查询
const query = {
  // 筛选条件
  filters: {
    people_id: data => ({
      name: 'people_id',
      value: ParseParams.id(data),
      type: 'ID',
      desc:'id、ids、exists、not-exists'
    }),
    posts_id: data => ({
      name: 'posts_id',
      value: ParseParams.id(data),
      type: 'ID',
      desc:'id、ids、exists、not-exists'
    }),
    comment_id: data => ({
      name: 'comment_id',
      value: ParseParams.id(data),
      type: 'ID',
      desc:'id、ids、exists、not-exists'
    })
  },
  // 排序，page size，page number
  options: {
    page_number: data => ({
      name: 'skip',
      value: data - 1 >= 0 ? data - 1 : 0,
      type: 'Int',
      desc:'第几页，从1开始'
    }),
    page_size: data => ({
      name: 'limit',
      value: data,
      type: 'Int',
      desc:'每页数量'
    }),
    sort_by: data => ({
      name: 'sort',
      value: ParseParams.sortBy(data),
      type: 'String',
      desc:'排序方式，例如：create_at:1'
    })
  }
}

// 储存
const save = {
  posts_id: data => ({
    name: 'posts_id',
    value: data,
    type: 'ID',
    desc: '帖子ID'
  }),
  comment_id: data => ({
    name: 'comment_id',
    value: data,
    type: 'ID',
    desc: '评论ID'
  }),
  people_id: data => ({
    name: 'people_id',
    value: data,
    type: 'ID',
    desc: '用户ID'
  })
}

// 更新
const update = {
  // 筛选参数
  filters: {
    posts_id: data => ({
      name: 'posts_id',
      value: data,
      type: 'ID',
      desc: '帖子ID'
    }),
    comment_id: data => ({
      name: 'comment_id',
      value: data,
      type: 'ID',
      desc: '评论ID'
    }),
    people_id: data => ({
      name: 'people_id',
      value: data,
      type: 'ID',
      desc: '用户ID'
    })
  },
  // 更新内容
  content: {
  }
}

export default { query, save, update }
