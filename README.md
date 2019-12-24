<p align="center">
<img src="https://qncdn.xiaoduyu.com/20190507.png" alt="小度鱼" width="100">
</p>
<h1 align="center">小度鱼(API)</h1>
<p align="center">年轻人的交流社区</p>

## 小度鱼开源项目
|项目|项目体验|原代码|主要技术栈|
|:---:|:---:|:---:|:---:|
|WEB网站|[www.xiaoduyu.com](https://www.xiaoduyu.com)|[github.com/54sword/xiaoduyu.com](https://github.com/54sword/xiaoduyu.com)|React、Redux、React-Router、GraphQL|
|APP（iOS、Android）|![小度鱼](https://qncdn.xiaoduyu.com/qrcode.png "小度鱼")|[github.com/54sword/xiaoduyuReactNative](https://github.com/54sword/xiaoduyuReactNative)|React-Native、Redux、React-Navigation、GraphQL|
|后端API|[www.xiaoduyu.com/graphql](https://www.xiaoduyu.com/graphql)|[github.com/54sword/api.xiaoduyu.com](https://github.com/54sword/api.xiaoduyu.com)|TypeScript、NodeJS、Express、MongoDB、GraphQL|
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
npm install -g supervisor
```
   
5、创建默认的配置文件，并根据需要修改其中的配置   

```
cp ./config/index.default.ts ./config/index.ts
```

6、创建日志文件夹  

```
mkdir ./logs
```
   
7、启动监听服务，保持进程不要关闭，运行TypeScript编译器，监控src里面的文件变化 
   
```
npm run watch-ts
```
   
8、另外再启动项目服务 
  
```
npm run dev
```

9、浏览器中打开 http://localhost:3000

## 手动部署到服务器
1、安装 Node.js[必须]、MongoDB[必须]，并启动 MongoDB  
2、打包项目  

```
npm run dist
```

3、将 dist、public、package.json、package-lock.json 上传到服务器，然后在服务器进入到项目目录，执行如下命令，安装依赖包  

```
npm install
```
4、在项目目录下创建logs文件夹  
5、启动服务   

```
node ./dist/src/index.js
```

## 脚本部署（将本地项目安装或更新到服务器）
使用shell脚本一键安装或更新  

1、服务器上安装nodejs与pm2，并需支持全局调用node、pm2命令  
 
2、配置ssh免密码登录服务器  
让本机支持ssh免密码登录服务器，配置方法：[https://www.cnblogs.com/bingoli/p/10567734.html](https://www.cnblogs.com/bingoli/p/10567734.html)   

3、创建相关的配置文件   
 
```
cp config/server.default.config.js config/server.config.js
```
填写 SERVER_IP、PM2_NAME、SERVER_DIR 配置项  

4、执行安装命令

```
npm run install-to-server
```
5、执行更新命令（本地有修改需要更新的时候执行）

```
npm run update-to-server
```

## 开源协议
MIT
