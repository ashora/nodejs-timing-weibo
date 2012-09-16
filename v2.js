//import some libs
var express = require('express');
var cons = require('consolidate');
var wb = require('./lib/weibo-v2.js').WeiboApi;

var config=require("./mods/config.js").get();
var util=require("./mods/util.js");
var sql=require("./mods/sql.js");
var static_server=require("./mods/static_server.js")
//oauth 2.0的方法和路由
var app_auth=require("./mods/app_auth.js")
var list_post=require("./mods/app_list_post.js")
var app_zhua=require("./mods/app_zhua.js")
//init express app
var app = express();
app.use(express.logger({
    format: ':method :url :status'
}));
//设置文件上传临时文件夹
app.use(express.bodyParser({
    uploadDir:'./uploads'
}));
app.use(express.cookieParser());
app.use(express.session({
    secret: 'yutou'
}));
app.use(app.router);
app.use(express.errorHandler({
    dumpExceptions: true, 
    showStack: true
}));
app.error=function(err, req, res){
    console.log("500:" + err + " file:" + req.url)
    res.render('500');
}
//设置模板引擎为mustache，这里使用了consolidate库
app.engine("html", cons.mustache);
//设置模板路径
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.set('view options', {
    layout: false
}) 
//静态图片服务 
app.get("/images/*",static_server.server)

//获取authorize url
app.get("/auth",app_auth.auth)
//获取accesstoken ,存储，并设置userid到cookie
app.get("/sina_auth_cb",app_auth.sina_auth_cb)
//首页代码
app.get('/', function(req, res){
    res.render('index.html',{
        data:{
            error:req.query.error
        }
    });
});
//中间页面，提醒用户认证成功
app.get('/oauth', function(req, res){
    res.render('oauth.html');
});
//list页面展示
app.get('/list', function(req, res) {
    var userid=req.cookies.userid
    //判断cookie里是否有userid，没有则重新绑定
    if(!userid){
        req.method = 'get'; 
        res.redirect('/'); 
    }
    if(config.is_updating&&(!req.query.debug)){
        res.render('update.html')
    }
    //从消息队列表里取出当前用户设定的所有微博信息。展示到页面
    sql.select(config.table_queue,'where wb_id="'+userid+'" ORDER BY send_time DESC',function(data,error){
        if(error){
            util.log_error(userid+": select queue error:"+error)
            req.session.list_error="查询列表失败！"
        }else{
            data.forEach(function(d,i){
                d.send_time=util.sqltime_to_displaytime(d.send_time)
            })
            util.log_process(userid+":view /list data:"+data)
        }
       
        res.render('list_v2.html',{
            data:{
                results:data,
                username:req.cookies.username,
                error:req.session.list_error
            }
        });
        req.session.list_error=""
    })
});
//list页面post处理
app.post('/list',list_post.post);
//删除消息功能
app.get('/del', function(req, res) {
    if(req.query.id){
        sql.del(config.table_queue,"id",req.query.id)
    }
    req.method = 'get'; 
    res.redirect('/list'); 
});
//重新绑定
app.get("/re",function(req,res){
    req.session.oauthUser=""
    res.redirect('/'); 
})
app.get("/zhua",app_zhua.zhua)
app.get("/zhuas",app_zhua.zhuas)

app.listen(config.run_port)


var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    host: "smtp.qq.com", // hostname
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    auth: {
        user: "676588498",
        pass: "*"
    }
});
process.on('uncaughtException', function (error) {
  
// setup e-mail data with unicode symbols
var mailOptions = {
    from: "676588498@qq.com", // sender address
    to: "sunxinyu@tianpin.com", // list of receivers
    subject: "nodejs error", // Subject line
    text: ""+error // plaintext body
}

// send mail with defined transport object
smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
        console.log(error);
    }else{
        console.log("Message sent: " + response.message);
    }
    // if you don't want to use this transport object anymore, uncomment following line
    //smtpTransport.close(); // shut down the connection pool, no more messages
});
});