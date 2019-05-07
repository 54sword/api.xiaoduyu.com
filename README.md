<p align="center">
<img src="https://qncdn.xiaoduyu.com/20190507.png" alt="小度鱼" width="100">
</p>
<h3 align="center">小度鱼(API)</h3>
<p align="center">年轻人的交流社区</p>

## 小度鱼开源项目
|项目|项目体验|原代码|主要技术栈|
|:---:|:---:|:---:|:---:|
|WEB网站|[www.xiaoduyu.com](https://www.xiaoduyu.com)|[github.com/54sword/xiaoduyu.com](https://github.com/54sword/xiaoduyu.com)|React、Redux、React-Router、GraphQL|
|APP（iOS、Android）|![小度鱼](https://qncdn.xiaoduyu.com/qrcode.png "小度鱼")|[github.com/54sword/xiaoduyuReactNative](https://github.com/54sword/xiaoduyuReactNative)|React-Native、Redux、React-Navigation、GraphQL|
|后端API|[www.xiaoduyu.com/graphql](https://www.xiaoduyu.com/graphql)|[github.com/54sword/api.xiaoduyu.com](https://github.com/54sword/api.xiaoduyu.com)|TypeScript、NodeJS、Express、GraphQL、MongoDB|
|后台管理|[admin.xiaoduyu.com](http://admin.xiaoduyu.com)|[github.com/54sword/admin.xiaoduyu.com](https://github.com/54sword/admin.xiaoduyu.com)|React、Redux、React-Router、GraphQL|


## 开发环境部署

线上运行版本 Node.js 是 v10.15.3，MongoDB 是 v4.0.6

1、安装 Node.js[必须]、MongoDB[必须]，并启动 MongoDB   
2、克隆项目   
```
git clone git@github.com:54sword/api.xiaoduyu.com.git   
```
   
3、进入项目   
```
cd api.xiaoduyu.com
```
   
4、安装依赖包   
```
npm install
npm install -g typescript
```
   
5、创建默认的配置文件，并根据需要修改其中的配置   
```
cp ./config/index.default.ts ./config/index.ts
```

6、创建日志文件夹  
```
mkdir ./logs
```
   
7、运行TypeScript编译器，监控src里面的文件变化      
```
npm run watch-ts
```
   
8、启动项目  
```
npm run start
```

9、浏览器中打开 http://localhost:3000

## 线上部署
1、安装 Node.js[必须]、MongoDB[必须]，并启动 MongoDB  
2、打包项目  
注意：只要有修改了，都需要重新打包  
```
npm run dist
```

3、将 dist、public、logs、package.json、package-lock.json 上传到服务器，然后在服务器进入到项目目录，然后执行如下命令，安装依赖包  
```
npm install
```

4、启动服务  
```
node ./dist/src/index.js
```

## 开源协议
MIT
