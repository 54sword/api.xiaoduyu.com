
var Oauth = require('../schemas').Oauth;

var sources = {
  'qq': 0,
  'weibo': 1,
  'github': 2,
  'wechat': 3
};

/*
exports.fetchByOpenId = function(id, callback) {

  Oauth.find({ openid: id })

  .exec(callback)

}
*/

// 通过用户的id获取
exports.fetchByUserId = function(userId, callback) {
  Oauth.find({ user_id: userId })
  .exec(function(err, oauths){

    var oauths = JSON.stringify(oauths);
    oauths = JSON.parse(oauths);

    var _sources = {};
    for (var i in sources) {
      _sources[i] = '';
    }

    for (var i = 0, max = oauths.length; i < max; i++) {
      for (var n in sources) {
        if (oauths[i].source == sources[n]) {
          _sources[n] = oauths[i];
          delete _sources[n].source;
        }
      }
    }

    callback(err, _sources);
  });
};


exports.fetchByUserIdAndSource = function(userId, _source, callback) {
  Oauth.findOne({ user_id: userId, source: sources[_source] })
  .exec(callback);
};


// 通过 openid 和 source 查询
exports.fetchByOpenIdAndSource = function(openid, _source, callback) {
  Oauth.findOne({ openid: openid, source: sources[_source] })
  .populate([
    {
      path: 'user_id',
      select: { 'access_token': 1}
    }
  ])
  .exec(callback);
};

// 创建 oauth 账户
exports.create = function(info, callback) {

  var oauth = new Oauth();
  oauth.openid = info.openid;
  oauth.access_token = info.access_token;
  oauth.expires_in = info.expires_in || 0;

  if (info.refresh_token) {
    oauth.refresh_token = info.refresh_token;
  }

  oauth.source = sources[info.source];
  oauth.user_id = info.user_id;
  oauth.save(callback);

};

// 更新 oauth 的信息
exports.updateById = function(id, info, callback) {
  Oauth.update({ _id: id },{ $set: info }).exec(callback);
};

// 删除
exports.updateDeleteStatus = function(id, bl, callback) {
  Oauth.update({ _id: id },{ $set: { 'deleted': bl }}).exec(callback);
  // Oauth.remove({ _id: id }).exec(callback);
};
