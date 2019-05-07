import jwt from 'jsonwebtoken'
import config from '../../config'

const { jwtSecret } = config

export const encode = function(data: any): string {
  return jwt.sign(data, jwtSecret);
}

/**
 * 解码
 * @param token  JWT
 */
export const decode = function(token: string): any {
  try {
    return jwt.verify(token, jwtSecret)
  } catch (e) {
    console.log(e)
    return null
  }
}