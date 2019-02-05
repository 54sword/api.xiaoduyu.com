
import { addReport } from './arguments'
import { getArguments } from '../tools'

export const Schema = `
  # 修改密码
  type addRepory {
    # 结果
    success: Boolean
  }

  type report {
    id: Int
    text: String
  }

  type fetchReportTypes {
    success: Boolean
    data: [report]
  }
`

export const Query = `
  fetchReportTypes: fetchReportTypes
`

export const Mutation = `
  # 修改密码
  addReport(${getArguments(addReport)}): addRepory
`
