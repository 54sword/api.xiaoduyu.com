
/***
 * 创建基础数据操作功能
 * @class Model
 */

export default class Model {

  readonly schema: any

  constructor (schema: any) {
    this.schema = schema
  }

  /**
   * 执行数据库操作后的回调方法
   * @param  {Function}   resolve 成功
   * @param  {Function}   reject  失败
   * @return {Function}
   */
  callback (resolve: any, reject: any): any {
    return (err: any, res: any) => {

      if (res && typeof res == 'object') {
        // 这里转换的目的是将 _id 是 ObjectId 类型，需要转换成 String 类型，否则graphql获取_id会是null
        try {
          res = JSON.parse(JSON.stringify(res));
        } catch (error) {
          reject(error);
          return;
        }
      }

      err ? reject(err) : resolve(res);
    }
  }

  /**
   * 储存文档
   * @param {Object} data - 储存对象
   * @return {Object} promise
   */
  save ({ data }: any): Promise<object> {
    return new Promise((resolve, reject) => {
      if (!data) return reject('data is null');
      new this.schema(data).save(this.callback(resolve, reject));
    });
  }

  /**
   * 查找一条数据
   * @param {Object} object
   * @param {Object} object.query - 查询条件
   * @param {Object} object.select - 返回字段
   * @param {Object} object.options - 选项（排序、数量等）
   * @return {Object} promise
   */
  findOne ({ query, select = {}, options = {} }: any): Promise<object> {
    return new Promise((resolve, reject) => {
      if (!query) return reject('query is null');
      let find = this.schema.findOne(query, select);
      for (let i in options) find[i](options[i]);
      find.exec(this.callback(resolve, reject));
    });
  }

  /**
   * 查询多个
   * @param {Object} query 查询条件
   * @param {Object} select 返回字段
   * @param {Object} options 选项（排序、数量等）
   * @return {Object} promise
   */
  find ({ query, select = {}, options = {} }: any): Promise<object> {
    return new Promise((resolve, reject) => {
      if (!query) return reject('query is null');
      let find = this.schema.find(query, select);
      for (let i in options) find[i](options[i]);
      find.exec(this.callback(resolve, reject));
    });
  }

  /**
   * 填充查询 - 基于 find 或 findOne 查询的文档，查询文档中关联的文档
   * @param {Object} collections 文档
   * @param {Object} options 选项（排序、数量等）
   * @return {Object} promise
   */
  populate ({ collections, options = {} }: any): Promise<object> {
    return new Promise((resolve, reject) => {
      if (!collections) return reject('collections is null');
      this.schema.populate(collections, options, this.callback(resolve, reject));
    });
  }

  /**
   * 多个文档更新
   * @param {Object} query 查询条件
   * @param {Object} update 更新字段
   * @param {Object} options 选项
   * @return {Object} promise
   */
  update ({ query, update, options = {} }: any): Promise<object> {
    return new Promise((resolve, reject) => {
      if (!query) return reject('query is null');
      if (!update) return reject('update is null');
      this.schema.updateMany(query, update, options, this.callback(resolve, reject));
    });
  }

  /**
   * 单个更新文档
   * @param {Object} query 查询条件
   * @param {Object} update 更新字段
   * @param {Object} options 选项
   * @return {Object} promise
   */
  updateOne ({ query, update, options = {} }: any): Promise<object> {
    return new Promise((resolve, reject) => {
      if (!query) return reject('query is null');
      if (!update) return reject('update is null');
      this.schema.updateOne(query, update, options, this.callback(resolve, reject));
    });
  }

  /**
   * 移除文档
   * @param {Object} query 移除条件
   * @return {Object} promise
   */
  remove ({ query }: any): Promise<object> {
    return new Promise((resolve, reject) => {
      if (!query) return reject('query is null');
      this.schema.deleteMany(query, this.callback(resolve, reject));
    });
  }

  removeOne ({ query }: any): Promise<object> {
    return new Promise((resolve, reject) => {
      if (!query) return reject('query is null');
      this.schema.deleteOne(query, this.callback(resolve, reject));
    });
  }
  
  /**
   * 计数查询
   * @param {Object} query 查询条件
   * @return {Object} promise
   */
  count ({ query = {} }: any): Promise<object> {
    return new Promise((resolve, reject) => {
      this.schema.countDocuments(query, this.callback(resolve, reject));
    });
  }

  /**
   * 聚合查询
   * @param {Object} query 查询条件
   * @return {Object} promise
   */
  aggregate (query: any): Promise<object> {
    return this.schema.aggregate(query);
  }

}
