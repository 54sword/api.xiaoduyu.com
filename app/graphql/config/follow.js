
// 查询
const query = {
  // 筛选条件
  filters: {
    user_id: data => ({
      name: 'user_id', value: data, type: 'String', desc:'话题ID'
    }),
    topic_id: data => {

      if (data == 'exists') {
        data = { '$exists': true }
      } else if (data == 'not-exists') {
        data = { '$exists': false }
      }
      
      return {
        name: 'topic_id', value: data, type: 'String', desc:'话题ID'
      }
    },
    posts_id: data => {

      if (data == 'exists') {
        data = { '$exists': true }
      } else if (data == 'not-exists') {
        data = { '$exists': false }
      }

      return {
        name: 'posts_id', value: data, type: 'String', desc:'话题ID'
      }
    },
    people_id: data => {

      if (data == 'exists') {
        data = { '$exists': true }
      } else if (data == 'not-exists') {
        data = { '$exists': false }
      }

      return {
        name: 'people_id', value: data, type: 'String', desc:'话题ID'
      }
    },
    // 因为int类型长度大于11位，graphql 会认为格式不是int
    start_create_at: data => ({
      name: 'create_at', value: { '$gte': parseInt(data) },
      type: 'String', desc:'开始日期'
    }),
    end_create_at: data => ({
      name: 'create_at', value: { '$lte': parseInt(data) },
      type: 'String', desc:'结束日期'
    }),
    deleted: data => ({
      name: 'deleted', value: data,
      type: 'Boolean', desc:'删除'
    }),
  },
  // 排序，page size，page number
  options: {
    page_number: data => ({
      name: 'skip', value: data - 1 >= 0 ? data - 1 : 0,
      type: 'Int', desc:'第几页'
    }),

    page_size: data => ({
      name: 'limit', value: data,
      type: 'Int', desc:'每页数量'
    }),

    sort_by: data => {

      let value = {};
      (data+'').split(',').map(item=>{
        if (item) value[item] = -1;
      });

      return ({
        name: 'sort', value,
        type: 'String', desc:'排序方式: create_at,comment_count,like_count'
      })
    }
  }
}

// 储存
const save = {
  topic_id: data => ({
    name: 'topic_id', value: data, type: 'String', desc:'话题ID'
  }),
  posts_id: data => ({
    name: 'posts_id', value: data, type: 'String', desc:'帖子ID'
  }),
  user_id: data => ({
    name: 'user_id', value: data, type: 'String', desc:'用户ID'
  }),
  status: data => ({
    name: 'status', value: data, type: 'Boolean', desc:'关注状态'
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
