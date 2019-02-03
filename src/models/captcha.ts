import { Captcha } from '../schemas'
import baseMethod from './base-method'

class Model extends baseMethod {
  create(data: any) {
    data.captcha = Math.round(900000*Math.random()+100000)
    return this.save({ data })
  }
}

export default new Model(Captcha)