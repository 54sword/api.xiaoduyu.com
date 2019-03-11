
/**
 * graphql 参数的解析方法
 */


/**
 * id解析
 *
 * @param  {String} ids id字符串，多个id使用","分隔，同时支持判断字段是否存在，exists、not-exists
 * @return {Object}     mongoose 查询语法
 *
 * @example id('5bc1b01cd6c9bd03c79e5ee0,5bc1b017d6c9bd03c79e5ede')
 */
export const id = function(ids: string): any {

  let data;

  if (ids == 'exists') {
    data = { '$exists': true }
  } else if (ids == 'not-exists') {
    data = { '$exists': false }
  } else {
    let _ids = ids + '';
    data = _ids.indexOf(',') != -1 ? { '$in': _ids.split(',') } : _ids;
  }

  return data;
}


/**
 * 排序方式
 *
 * @param  {String} data 查询条件，排序字段:正序或倒序，多个使用“,”分隔
 * @return {Object}      mongoose 查询语法
 *
 * @example sortBy('create_at:1,comment_count:-1,like_count:1')
 */
export const sortBy = function(data: string): any {

  let value: any = {};

  (data+'').split(',').map(item=>{
    if (!item) return;

    let arr = item.split(':');
    let name = arr[0];
    let sort = arr[1] ? parseInt(arr[1]) : -1;

    // 如果既不是正序也不是倒序，那么默认使用倒序
    if (sort != -1 && sort != 1) sort = -1;
    value[name] = sort;

  });

  return value;
}

/**
 * 模糊搜索
 *
 * @param  {String} str 关键词
 * @return {Object} mongoose 查询语法
 */
export const search = function(str: string): any {
  let s = (str+'').split(' ');
  return { $regex: RegExp("("+s.join('|')+")","i") }
}

/*
export const operation = function(str: string): any {

  let obj: any;

  let arr = [
    { str: '>=', symbol: '$gte' },
    { str: '<=', symbol: '$lte' },
    { str: '<', symbol: '$lt' },
    { str: '>', symbol: '$$gt' },
    { str: '!=', symbol: '$ne' }
  ];

  arr.map((item: any)=>{
    if (str.indexOf(item.str) != -1) {
      let arr = str.replace(item.str, '');
      obj = {};
      obj[item.symbol] = parseInt(arr[1])
    }
  });

  return obj

}
*/