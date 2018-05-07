
// 查询
const query = {
  // 筛选条件
  filters: {
    people_id: data => {

      if (data == 'exists') {
        data = { '$exists': true }
      } else if (data == 'not-exists') {
        data = { '$exists': false }
      }

      return {
        name: 'people_id', value: data, type: 'String', desc:'id / exists / not-exists'
      }
    },

    posts_id: data => {

      if (data == 'exists') {
        data = { '$exists': true }
      } else if (data == 'not-exists') {
        data = { '$exists': false }
      }

      return {
        name: 'posts_id', value: data, type: 'String', desc:'id / exists / not-exists'
      }
    },

    comment_id: data => {

      if (data == 'exists') {
        data = { '$exists': true }
      } else if (data == 'not-exists') {
        data = { '$exists': false }
      }

      return {
        name: 'comment_id', value: data, type: 'String', desc:'id / exists / not-exists'
      }
    }

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

      let value = {}
      value[data] = -1

      return ({ name: 'sort', value, type: 'String', desc:'排序方式' })
    }
  }
}

// 储存
const save = {
  posts_id: data => ({
    name: 'posts_id', value: data, type: 'ID', desc: '帖子ID'
  }),
  comment_id: data => ({
    name: 'comment_id', value: data, type: 'ID', desc: '评论ID'
  }),
  people_id: data => ({
    name: 'people_id', value: data, type: 'ID', desc: '用户ID'
  })
}

// 更新
const update = {
  // 筛选参数
  filters: {
    posts_id: data => ({
      name: 'posts_id', value: data, type: 'ID', desc: '帖子ID'
    }),
    comment_id: data => ({
      name: 'comment_id', value: data, type: 'ID', desc: '评论ID'
    }),
    people_id: data => ({
      name: 'people_id', value: data, type: 'ID', desc: '用户ID'
    })
  },
  // 更新内容
  content: {
  }
}

export default { query, save, update }
