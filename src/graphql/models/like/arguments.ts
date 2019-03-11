import * as ParseParams from '../../common/parse-params';

// 储存
export const like = {
  type: (data: string) => ({
    typename: 'save',
    name: 'type',
    value: data,
    type: 'String',
    desc:'类型posts/comment/reply'
  }),
  target_id: (data: string) => ({
    typename: 'save',
    name: 'target_id',
    value: ParseParams.id(data),
    type: 'String',
    desc:'目标类型的id'
  }),
  mood: (data: number) => ({
    typename: 'save',
    name: 'mood',
    value: data,
    type: 'Int',
    desc:'心情：1是赞/2是踩'
  }),
  status: (data: boolean) => ({
    typename: 'save',
    name: 'status',
    value: data,
    type: 'Boolean',
    desc:'状态'
  })
}
