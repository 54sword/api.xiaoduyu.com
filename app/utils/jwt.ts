import jwt from 'jsonwebtoken'
import config from '../../config'

const { jwt_secret } = config

export const encode = function(data: any): string {
  return jwt.sign(data, jwt_secret);
}

/**
 * 解码
 * @param token  JWT
 */
export const decode = function(token: string): any {
  try {
    return jwt.verify(token, jwt_secret)
  } catch (e) {
    return null
  }
}