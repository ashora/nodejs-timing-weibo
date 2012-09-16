nodejs-timing-weibo
===================

定时发微博的nodejs服务代码，基本功能是可以定时发微博，其他功能包括自动打水印，从制定网页抓取微博，批量从多个网页抓取微博并设置整点微博等。

== 特性 ==

* 定时发布无图微博
* 定时发布带图微博
* 可以对图片统一自动加头尾打logo
* 制定特定的url，对url内容抓取获取微博内容和图片。
* 批量进行上述操作，并以当前时间点为基准向后依次设置整点微博。
* 可以设置批量抓取后的微博的定时间隔的大小。

== 运行 ==

web服务：`nohup node v2.js >v2.out 2>&1 &`

本地定时轮训服务：`nohup node local_interval.js >local_interval.out 2>&1 &`

== 依赖 ==

node-canvas （node-canvas 依赖 cairo ，cairo 依赖pixman，pnglib，jpglib。）[https://github.com/LearnBoost/node-canvas](https://github.com/LearnBoost/node-canvas)

express 

consolidate

mustache

[weibo-v2](https://github.com/vzhishu/node-weibo-v2) 不支持upload图片，不支持缩短url，不支持传入多个重名配置，所以自己做了改写，具体见源码

mysql

readof [https://github.com/xinyu198736/readOnlineFile](https://github.com/xinyu198736/readOnlineFile)

= 界面 =
![界面](http://ww2.sinaimg.cn/mw690/6663ae3cgw1dwu6s0s156j.jpg)
