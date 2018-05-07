
import { getQuerySchema, getUpdateSchema, getSaveSchema } from '../config';

exports.Schema = `

  type blocks {
    success: Boolean
  }

  # 添加屏蔽
  type addBlock {
    success: Boolean
  }

  # 移除屏蔽
  type removeBlock {
    success: Boolean
  }

`

exports.Query = `

  # 获取屏蔽列表
  blocks(${getQuerySchema('block')}): blocks

`

exports.Mutation = `

  # 添加屏蔽
  addBlock(${getSaveSchema('block')}): addBlock

  # 移除屏蔽
  removeBlock(${getUpdateSchema('block')}): removeBlock

`
