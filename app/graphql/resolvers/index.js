// import Posts from '../modelsa/posts'
// import User from './../modelsa/user'

import { posts } from './posts'

var resolvers = {
  Query: {
    hello(root) {
      return 'world';
    },
    author(root, args){    // args就是上面schema中author的入参
      return { id: 1, firstName: 'Hello', lastName: 'World' };
    },
    posts
  },

  Mutation: {
    addUser(root) {
      console.log('123123');
      return 'ok'
    }
  },

  Author: {
    // 定义author中的posts
    posts(author){
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
