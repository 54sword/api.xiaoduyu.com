
import { getQuerySchema, getUpdateSchema, getSaveSchema } from '../config';

exports.Schema = `

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

exports.Query = `
  fetchReportTypes: fetchReportTypes
`

exports.Mutation = `

  # 修改密码
  addReport(${getSaveSchema('report')}): addRepory

`
