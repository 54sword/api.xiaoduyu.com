/*
import { ads, addAD, updateAD } from './arguments'
import { getArguments } from '../tools'

export const Schema = `

  # 广告
  type ad {
    _id: String
    pc_img: String
    pc_url: String
    app_img: String
    app_url: String
    block_date: String
    deleted: Boolean
    create_at: String
    update_at: String
    close: Boolean
  }

  # 查询广告累计数
  type countAds {
    count: Int
  }

  # 添加广告
  type addAD {
    success: Boolean
  }

  # 更新广告
  type updateAD {
    success: Boolean
  }

`

export const Query = `
  # 查询广告
  ads(${getArguments(ads)}): [ad]
  # 查询广告累计数
  countAds(${getArguments(ads)}): countAds
`

export const Mutation = `
  # 添加广告
  addAD(${getArguments(addAD)}): addAD
  # 更新广告
  updateAD(${getArguments(updateAD)}): updateAD
`
*/