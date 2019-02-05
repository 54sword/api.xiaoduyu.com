import * as ParseParams from '../../common/parse-params';

export const addReport = {
  posts_id: (data: string) => ({
    typename: 'save',
    name: 'posts_id',
    value: ParseParams.id(data),
    type: 'ID',
    desc:'帖子id'
  }),
  people_id: (data: string) => ({
    typename: 'save',
    name: 'people_id',
    value: ParseParams.id(data),
    type: 'ID',
    desc:'用户id'
  }),
  comment_id: (data: string) => ({
    typename: 'save',
    name: 'comment_id',
    value: ParseParams.id(data),
    type: 'ID',
    desc:'评论id'
  }),
  report_id: (data: string) => ({
    typename: 'save',
    name: 'report_id',
    value: ParseParams.id(data),
    type: 'ID',
    desc:'评论id'
  }),
  detail: (data: string) => ({
    typename: 'save',
    name: 'detail',
    value: data,
    type: 'String',
    desc:'详情'
  })
}