import { sitemap } from './arguments'
import { getArguments } from '../tools'

export const Schema = `

  type sitemap_posts {
    _id: String
    update_at: String
  }

  type sitemap_topic {
    _id: String
  }

  type Sitemap {
    posts: [sitemap_posts]
    topics: [sitemap_topic]
  }
`
//  @cacheControl(maxAge: 1000)
export const Query = `
  sitemap(${getArguments(sitemap)}): Sitemap
`

export const Mutation = ``
