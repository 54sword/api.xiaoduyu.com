
import { getQuerySchema, getUpdateSchema, getSaveSchema } from '../config';

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
  addReport(${getSaveSchema('report')}): addRepory

`
