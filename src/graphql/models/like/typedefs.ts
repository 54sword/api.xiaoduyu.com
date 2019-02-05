import { like } from './arguments'
import { getArguments } from '../tools'

export const Schema = `
  type like {
    success: Boolean
  }
`

export const Query = `
`

export const Mutation = `
  # 赞
  like(${getArguments(like)}): like
`
