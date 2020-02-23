import { Posts, Topic } from '@src/models';

import To from '@src/utils/to';

// import * as Model from './arguments'
// import { getOption } from '../tools'

// 查询
const sitemap = async (root: any, args: any, context: any, schema: any) => {

  type Data = {
    _id:string,
    update_at?:string
  }
  
  let err: any,
      options = {
        skip: 0,
        limit: 10000
      },
      data: Array<Data>,
      result: {posts:Array<Data>,topics:Array<Data>} = { posts: [], topics: [] };

  let pageNumber = args.page_number - 1 >= 0 ? args.page_number - 1 : 0;
  
  options.skip = pageNumber * options.limit;

  [ err, data ] = await To(Posts.find({
    query: {
      deleted: false,
      weaken: false
    },
    select: {
      update_at: 1
    },
    options
  }));

  if (data && data.length > 0) {
    result.posts = data;
  }

  [ err, data ] = await To(Topic.find({
    query: {},
    options
  }));

  if (data && data.length > 0) {
    result.topics = data;
  }

  return result;
}

export const query = { sitemap }
export const mutation = {}