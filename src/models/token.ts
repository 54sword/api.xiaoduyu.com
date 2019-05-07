import { Token } from '../schemas'
import baseMethod from './base-method'
import * as JWT from '../utils/jwt'

interface Create {
  userId: string,
  ip: string
  expires?: number,
  options?: object
}

class Model extends baseMethod {

  create({ userId, ip, expires = 1000 * 60 * 60 * 24 * 30, options = {} }: Create): Promise<object> {
    return new Promise(async resolve=>{

      expires = new Date().getTime() + expires

      const token = JWT.encode({ expires, user_id: userId, options })
      
      // 储存token记录
      await this.save({
        data: { user_id: userId, token: token, ip }
      })

      resolve({
        user_id: userId,
        access_token: token,
        expires: Math.floor(expires/1000)
      });

    })
  }
}

export default new Model(Token)
