var wb = require('weibov2').WeiboApi;
var config=require("./mods/config.js").get();
var util=require("./mods/util.js");
var Client = require('mysql').Client;
var fs=require("fs")
////////////////////////////////////////////////////////
////以下为本地服务///////////////////
////定时读取数据库，然后队列发布，读取和发布异步////
////////////////////////////////////////////////////////

var clientCommon = new Client(); 
clientCommon.user = config.sql_username;  
clientCommon.password =config.sql_password;  
clientCommon.query('USE '+config.sql_table);  
//要发送的队列
var sendQueue=[]
//发送一条消息
var sendWB=function(data){
    var token=""
    var secret=""
    //取出当前微博设定用户的key和secret
    clientCommon.query(  
        'SELECT * FROM wb_id  where wb_id='+data.wb_id,function(err, results, fields){
            if(err){
                util.log_error("sendWB select sql error")
                return;
            }
            if(!results.length){
                console.log("not found user "+data.wb_id)
                return;
            }
            token=results[0].wb_accesstoken;
            //    secret=results[0].wb_secret;
            var opts = {
                app_key       :  config.weibo_key ,
                app_secret    :  config.weibo_secret 
            };
            var api = new wb(opts);
            //  console.log(data)
            if(data.pic&&data.pic.length>0){
                //上传图片
                api.statuses.upload({
                    access_token:token,
                    status:data.content
                },data.pic,function(_d){
                    try{
                          if(_d.error){
                        util.log_process("update weibo failed:"+JSON.stringify(_d))
                        clientCommon.query('update wb_queue  set wb_failreason=\''+JSON.stringify(_d)+'\' where id='+data.id)
                        return;
                    }
                    }catch(e){
                        util.log_process("updating error:"+JSON.stringify(e))
                    }
                    util.log_process("update weibo success:"+JSON.stringify(_d))
                    clientCommon.query(  
                        'DELETE FROM  '+config.table_queue+  
                        ' WHERE id='+data.id);
                    util.log_process("delete "+data.id)
                    fs.unlink(data.pic, function() {
                        util.log_process("delete pic:"+data.pic)
                    })
                })
            }else{
                api.statuses.update({
                    access_token:token,
                    status:data.content
                },function(_d){
                    try{
                          if(_d.error){
                        util.log_process("update weibo failed:"+JSON.stringify(_d))
                        clientCommon.query('update wb_queue  set wb_failreason=\''+JSON.stringify(_d)+'\' where id='+data.id)
                        return;
                    }
                    }catch(e){
                        util.log_process("updating error:"+JSON.stringify(e))
                    }
                  
                    util.log_process("update weibo success:"+JSON.stringify(_d))
                    clientCommon.query(  
                        'DELETE FROM  '+config.table_queue+  
                        ' WHERE id='+data.id);
                    util.log_process("delete "+data.id)
                })
            }
        })
}

//定时检查发布队列，如果发现队列不为空，则取出第一个元素，
//发送此元素，并从数据库删除此条数据。10秒检查一次队列
setInterval(function(){
    // console.log(sendQueue.length)
    if(sendQueue.length!=0){
        var send=sendQueue.shift();
       clientCommon.query('update wb_queue  set wb_failed=1 where id='+send.id)
        sendWB(send)
        
    } 
},20000);
//检查数据库中的所有消息的发送时间与当前时间的差，如果发现到了发送时间，则送到发送队列中等待发送。

setInterval(function(){
    clientCommon.query(  
        'SELECT * FROM '+config.table_queue+'  WHERE wb_failed=0 ORDER BY send_time',  
        function selectCb(err, results, fields) {  
            if (err) return console.log(err);
            var needSend=[] //需要发送的微博的数据
            var nowTime=new Date();
            nowTime=nowTime.getTime();
            //比较时间
            for(var i in results){
                var time=new Date(results[i].send_time);
                if(time.getTime()<=nowTime+180000){
                    needSend.push(results[i])
                }
            }
            //如果队列中不存在则加入队列中
            for(var i=0;i<needSend.length;i++){
                var isexist=false;
                for(var n=0;n<sendQueue.length;n++){
                    if(sendQueue[n].id==needSend[i].id){
                        isexist=true;
                    }
                };
                (!isexist)&&sendQueue.push(needSend[i]);
            }
            
        });
},5000)

//
//var nodemailer = require("nodemailer");
//
//// create reusable transport method (opens pool of SMTP connections)
//var smtpTransport = nodemailer.createTransport("SMTP",{
//    host: "smtp.qq.com", // hostname
//    secureConnection: true, // use SSL
//    port: 465, // port for secure SMTP
//    auth: {
//        user: "676588498",
//        pass: "xinyu_198736"
//    }
//});
//process.on('uncaughtException', function (error) {
//  
//    // setup e-mail data with unicode symbols
//    var mailOptions = {
//        from: "676588498@qq.com", // sender address
//        to: "sunxinyu@tianpin.com", // list of receivers
//        subject: "nodejs error", // Subject line
//        text: ""+error // plaintext body
//    }
//console.log(error)
//    // send mail with defined transport object
//    smtpTransport.sendMail(mailOptions, function(error, response){
//        if(error){
//            console.log(error);
//        }else{
//            console.log("Message sent: " + response.message);
//        }
//    smtpTransport.close(); // shut down the connection pool, no more messages
//    });
//});