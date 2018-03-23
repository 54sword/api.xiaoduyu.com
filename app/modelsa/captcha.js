
import { Captcha } from '../schemas';
import baseMethod from './base-method';
import To from '../common/to';

class Model extends baseMethod {

  create(ip) {
    return this.save({
      data: { captcha: Math.round(900000*Math.random()+100000), ip }
    });
  }

}

let Schemas = new Model(Captcha);

module.exports = Schemas;
