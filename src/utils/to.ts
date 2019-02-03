
/**
 * Promise 异常处理
 * @param promise 
 */
export default function to(promise: Promise<object>): any {

  if (!promise || !Promise.prototype.isPrototypeOf(promise)) {
    return new Promise((resolve, reject)=>{
      reject(new Error("requires promises as the param"));
    }).catch((err)=>{
      return [err, null];
    });
  }

  return promise.then(data => [null, data]).catch(err => [err]);
  
}
