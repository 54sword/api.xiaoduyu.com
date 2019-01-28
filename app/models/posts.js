
// var Posts = require('../schemas').Posts;
import { Posts } from '../schemas'
import baseMethod from './base-method'

export default new baseMethod(Posts)

/*
exports.add = function(info, callback) {

  new Posts(info).save(function(err, feed){

    if (err) console.log(err);

    var opts = [
      {
        path: 'user_id',
        select: {
          '_id': 1, 'avatar': 1, 'create_at': 1, 'nickname': 1, 'fans_total': 1, 'feed_total': 1, 'follow_total': 1, 'node_follow_total': 1, 'brief': 1
        }
      },
      {
        path: 'topic_id'
      }
    ];

    Posts.populate(feed, opts, callback);

  });
};


exports.findOne = function(query, select, callback) {
  Posts.findOne(query, select).exec(callback)
}

exports.populate = function(questions, opts, callback) {
  Posts.populate(questions, opts, callback);
}


exports.find = async ({ query = {}, select = {}, options = {}, callback = ()=>{} }) => {
  let find = Posts.find(query, select)
  for (var i in options) find[i](options[i])
  return await find.exec((err, result)=>{})
}


exports.update = async ({ conditions = {}, update = {}, options = {}, callback = ()=>{} }) => {
  return await Posts.update(conditions, update, options, callback)
}

*/
