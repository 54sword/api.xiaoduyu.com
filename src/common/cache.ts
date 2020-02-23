import config from '@config'

var LRU = require("lru-cache")
  , options = { max: 1000, maxAge: 1000 * config.cache.default }
  , cache = new LRU(options);

// if (!featureConfig.cache) {
//   cache = {
//     get: () => '',
//     set: () => ''
//   }
// }

export default cache;