import * as ParseParams from '../common/parse-params';

// 查询
const query = {
  // 筛选条件
  filters: {
    user_id: data => ({
      name: 'user_id',
      value: ParseParams.id(data),
      type: 'ID',
      desc:'ID'
    }),
    posts_id: data => ({
      name: 'posts_id',
      value: ParseParams.id(data),
      type: 'ID',
      desc:'帖子ID'
    }),
    comment_id: data => ({
      name: 'comment_id',
      value: ParseParams.id(data),
      type: 'ID',
      desc:'评论ID'
    }),
    // 因为int类型长度大于11位，graphql 会认为格式不是int
    start_create_at: data => ({
      name: 'create_at',
      value: { '$gte': data },
      type: 'String',
      desc:'开始日期'
    }),
    end_create_at: data => ({
      name: 'create_at',
      value: { '$lte': data },
      type: 'String',
      desc:'结束日期'
    }),
    preference: data => ({
      name: '',
      value: '',
      type: 'Boolean',
      desc:'偏好(登陆用户首页的信息流)'
    })
  },
  // 排序，page size，page number
  options: {
    page_number: data => ({
      name: 'skip',
      value: data - 1 >= 0 ? data - 1 : 0,
      type: 'Int',
      desc:'第几页'
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
      desc:'排序方式: create_at:1,comment_count:-1,like_count:1'
    })
  }
}

// 储存
const save = {}

// 更新
const update = {
  // 筛选参数
  filters: {},
  // 更新内容
  content: {}
}

export default { query, save, update }
