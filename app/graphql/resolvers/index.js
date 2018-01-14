// import Posts from '../modelsa/posts'
// import User from './../modelsa/user'

import posts from './posts'

console.log(posts);

let Query = {
  hello(root, params) {

    console.log(params);

    return params

    return { success: true, error: 20000 };
  },
  author(root, args){    // args就是上面schema中author的入参

    // console.log(args);
    // console.log('12333');
    // return '123'

    // return {}
    // return { success: true, error: 10000 };
    return { id: 1, firstName: 'Hello', lastName: 'World' };
  }
}

let Mutation = {}

Object.assign(Query, posts.query);
Object.assign(Mutation, posts.mutation);

var resolvers = {
  Query,
  Mutation,

  Posts: {
    user_id(posts) {
      // console.log(posts);
      // console.log('----');
      return { _id: 1, name: 'Hello',brief: '2' };
    }
  },

  Author: {
    // 定义author中的posts
    posts(author){

      console.log(author);

      return [
        { id: 1, title: 'A post', text: 'Some text', views: 2},
        { id: 2, title: 'Another post', text: 'Some other text', views: 200}
      ];
    },
  },
  Post: {
    // 定义Post里面的author
    author(post){
      return { id: 1, firstName: 'Hello', lastName: 'World' };
    },
  }
};

export default resolvers;
