
// 查询
const query = {
  // 筛选条件
  filters: {
    _id: data => {
      let _data = data + '';
      let value = _data.indexOf(',') != -1 ? { '$in': _data.split(',') } : _data;
      return {
        name: '_id', value,
        type: 'ID', desc:'ID'
      }
    },
    user_id: data => {
      let _data = data + '';
      let value = _data.indexOf(',') != -1 ? { '$in': _data.split(',') } : _data;
      return {
        name: 'user_id', value,
        type: 'ID', desc:'用户ID'
      }
    },
    topic_id: data => {
      let _data = data + '';
      let value = _data.indexOf(',') != -1 ? { '$in': _data.split(',') } : _data;
      return {
        name: 'topic_id', value,
        type: 'ID', desc:'话题ID'
      }
    },
    title: data => ({
      name: 'title', value: data,
      type: 'String', desc:'标题'
    }),
    deleted: data => ({
      name: 'deleted', value: data,
      type: 'Boolean', desc:'删除'
    }),
    weaken: data => ({
      name: 'weaken', value: data,
      type: 'Boolean', desc:'削弱'
    }),
    recommend: data => ({
      name: 'recommend', value: data,
      type: 'Boolean', desc:'推荐'
    }),

    // 因为int类型长度大于11位，graphql 会认为格式不是int
    start_create_at: data => ({
      name: 'create_at', value: { '$gte': parseInt(data) },
      type: 'String', desc:'开始日期'
    }),
    end_create_at: data => ({
      name: 'create_at', value: { '$lte': parseInt(data) },
      type: 'String', desc:'结束日期'
    }),
    method: data => ({
      name: '', value: '',
      type: 'String', desc:'模式(user_follow)'
    })
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
const save = {}

// 更新
const update = {
  // 筛选参数
  filters: {
    _id: data => ({
      name: '_id', value: data,
      type: 'ID!', desc:'ID'
    })
  },
  // 更新内容
  content: {
    deleted: data => ({
      name: 'deleted', value: data, role: 'admin',
      type: 'Boolean', desc:'删除'
    }),
    weaken: data => ({
      name: 'weaken', value: data, role: 'admin',
      type: 'Boolean', desc:'削弱'
    }),
    topic_id: data => ({
      name: 'topic_id', value: data,
      type: 'ID', desc:'话题ID'
    }),
    type: data => ({
      name: 'type', value: data,
      type: 'Int', desc:'类型'
    }),
    title: data => ({
      name: 'title', value: data,
      type: 'String', desc:'标题'
    }),
    content: data => ({
      name: 'content', value: data,
      type: 'String', desc:'正文JSON Draft'
    }),
    content_html: data => ({
      name: 'content_html', value: data,
      type: 'String', desc:'正文HTML'
    }),
    verify: data => ({
      name: 'verify', value: data, role: 'admin',
      type: 'Boolean', desc:'验证'
    }),
    recommend: data => ({
      name: 'recommend', value: data, role: 'admin',
      type: 'Boolean', desc:'推荐'
    }),
    sort_by_date: data => ({
      name: 'sort_by_date', value: data, role: 'admin',
      type: 'String', desc:'根据时间排序（越大越排前）'
    })
  }
}

export default { query, save, update }
