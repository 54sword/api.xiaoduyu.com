import { blocks, addBlock, removeBlock } from './arguments'
import { getArguments } from '../tools'

export const Schema = `

  type blocks_comment {
    _id: ID
    content_html: String
    posts_id: ID
    parent_id: ID
  }

  type blocks {
    _id: String
    deleted: Boolean
    create_at: String
    ip: String
    user_id: ID
    comment_id: blocks_comment
    people_id: sender_id
    posts_id: posts_id
  }

  # 添加屏蔽
  type addBlock {
    success: Boolean
    _id: ID
  }

  # 移除屏蔽
  type removeBlock {
    success: Boolean
  }

  # 帖子计数
  type countBlocks {
    count: Int
  }

`

export const Query = `

  # 获取屏蔽列表
  blocks(${getArguments(blocks)}): [blocks]

  # 帖子计数
  countBlocks(${getArguments(blocks)}): countBlocks

`

export const Mutation = `

  # 添加屏蔽
  addBlock(${getArguments(addBlock)}): addBlock

  # 移除屏蔽
  removeBlock(${getArguments(removeBlock)}): removeBlock

`
