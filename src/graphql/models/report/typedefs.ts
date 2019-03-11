
import { reports, addReport } from './arguments'
import { getArguments } from '../tools'

export const Schema = `

  type report_user {
    _id: String
    nickname: String
    avatar_url: String
    blocked: Boolean
  }

  type report_posts {
    _id: String
    title: String
    content_html: String
    user_id: report_user
    deleted: Boolean
  }

  type report_comment {
    _id: String
    content_html: String
    user_id: report_user
    deleted: Boolean
  }

  type reports{
    _id: String
    user_id: report_user
    comment_id: report_comment
    posts_id: report_posts
    people_id: report_user
    create_at: String
    report_id: Int
    detail: String
  }

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

  type countReports {
    count: Int
  }
`

export const Query = `
  reports(${getArguments(reports)}): [reports]
  countReports(${getArguments(reports)}): countReports
  fetchReportTypes: fetchReportTypes
`

export const Mutation = `
  # 修改密码
  addReport(${getArguments(addReport)}): addRepory
`
