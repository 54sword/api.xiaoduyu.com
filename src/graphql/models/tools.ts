

export const getArguments = (params: any): string => {

  let schema = ``;

  for (let i in params) {
    schema += `
      #${params[i]().desc}${params[i]().role == 'admin' ? ' (管理员)' : ''}
      ${i}:${params[i]().type}
    `
  }
  
  return schema;

}

const get = (type: string)=>{

  return ({ args = {}, model, role = '' }: any) => {

    let err, params: any = {};
  
    for (let i in args) {
  
      if (!model[i]) {
        err = i + ' is invalid';
        break;
      }
  
      let result = model[i](args[i]);

      if (result.typename != type) {
        continue;
      }
      
      if (result.role && role != result.role) {
        err = i + ' no access';
        break;
      }

      if (result.name) {
        if (typeof result.value == 'object') {
          if (!params[result.name]) params[result.name] = {};
          for (let n in result.value) params[result.name][n] = result.value[n];
        } else {
          params[result.name] = result.value;
        }
      }
      
    }

    if (type == 'option') {

      // limit默认值
      if (!params.limit) {
        params.limit = 30;
      } else if (params.limit > 300) {
        // limit 最大值
        params.limit = 300;
      }
    
      params.skip = !params.skip ? 0 : params.skip * params.limit;
    
    }
  

    return [ err, params ]
 
  }

}

export const getQuery = get('query')
export const getOption = get('option')
export const getSave = get('save')