# 小度鱼（后端API篇）

## 介绍
小度鱼，是基于 React + NodeJS + Express + MongoDB 开发的一个社区系统  
线上站点：[https://www.xiaoduyu.com](https://www.xiaoduyu.com)  
前端源码地址：[https://github.com/54sword/xiaoduyu.com](https://github.com/54sword/xiaoduyu.com)  
后端API源码地址：[https://github.com/54sword/api.xiaoduyu.com](https://github.com/54sword/api.xiaoduyu.com)  

## 特点
+ 图片分离，图片上传至七牛
+ 支持 JWT(JSON Web Token)
+ 支持 SendCloud 发送邮件
+ 支持邮箱、QQ、微博注册登录

## 安装部署
不保证 Windows 系统的兼容性  
线上运行版本 Node.js 是 v8.7.0，MongoDB 是 v3.4.9

	1. 安装 Node.js[必须] MongoDB[必须]
	2. git clone git@github.com:54sword/api.xiaoduyu.com.git
	3. cd api.xiaoduyu.com
	4. npm install
	5. cp ./config/config.default.js ./config/index.js 请根据需要修改 index.js 配置文件
	6. node server.js
	7. 访问 http://localhost:3000
	8. 完成

## 开源协议
MIT
