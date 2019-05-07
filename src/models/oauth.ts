import { Oauth } from '../schemas'
import baseMethod from './base-method'

import social from '../../config/social'

/*
const sources = {
  'qq': 0,
  'weibo': 1,
  'github': 2,
  'wechat': 3
};
*/

/**
 * Oauth 查询类
 * @extends Model
 */

class OauthModel extends baseMethod {

  /**
   * 通过用户id和来源条件查询用户
   * @param  {String} userId  用户的id
   * @param  {Int} _source 来源id
   * @return {Object} Promise
   */
  fetchByUserIdAndSource(userId: string, _source: string) {
    return this.findOne({
      query: { user_id: userId, source: social[_source] }
    })
  }

  fetchByOpenIdAndSource(openid: string, _source: string) {
    return this.findOne({
      query: { openid, source: social[_source] }
    })
  }

}

export default new OauthModel(Oauth)