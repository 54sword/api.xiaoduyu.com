
import Captcha from '../../modelsa/captcha'
import { domain } from '../../../config'

let query = {}
let mutation = {}
let resolvers = {}

import To from '../../common/to'
import CreateError from './errors'
import Querys from '../querys'
import Updates from '../updates'

query.captcha = async (root, args, context, schema) => {

  const { ip } = context;

  let err, result;

  [ err, result ] = await To(Captcha.findOne({
    query: { ip },
    select: { _id: 1 },
    options: { sort:{ create_at: -1 } }
  }));

  if (!result) return { _id: '', url: '' };

  [ err, result ] = await To(Captcha.save({
    data: { captcha: Math.round(900000*Math.random()+100000), ip }
  }));

  return { _id: result._id, url: domain + '/api/v2/captcha-image/' + result._id }
}

exports.query = query;
exports.mutation = mutation;
exports.resolvers = resolvers;
