var fs=require("fs")
var config=require("./config.js").get();
var util=require("./util.js")
var sql=require("./sql.js")
var do_pic=require("./do_pic.js")
var zhua=require("./zhua.js")


var url_reg=/^http:\/\/(www.***.com)(\/detail\?id=.*)$/
var pic_reg=/<div id="bdshare" class=".*?" data="{'text':'.*?', 'pic':'(.*?)' ,/
var content_reg=/<div id="bdshare" class=".*?" data="{'text':'(.*?)', 'pic':'.*?' ,/

exports.zhua=function(req,res){
    var userid=req.cookies.userid;
    var url=req.query.url
    var return_error=function(info){
        util.log_error(userid+": zhua url:"+url+" error:"+info)
        res.render('zhua.html',{
            data:'{"error":"'+info+'"}'
        });
    }
    if(!userid){
        return_error("no userid")
        return;
    }
    zhua.zhua({
        userid:userid,
        url:url,
        url_reg:url_reg,
        pic_type:"images/jpg",
        pic_reg:pic_reg,
        content_reg:content_reg
    },function(data,error){
        if(error){
            return_error(error)
            return;
        }
        res.render('zhua.html',{
            data:'{"pic":"'+data.pic+'","content":"'+data.content+'"}'
        });
    })
    
}

exports.zhuas=function(req,res){
    var userid=req.cookies.userid;
    var urls=req.query.urls
    urls=urls.split(/\n/)
    var return_error=function(info){
        util.log_error(userid+": zhuas urls:"+urls+" error:"+info)
        res.render('zhua.html',{
            data:'{"error":"'+info+'"}'
        });
    }
    if(!userid){
        return_error("no userid")
        return;
    }
    var lastTime=req.query.lastTime*1;
    if(!!lastTime){
        var nowTime=lastTime*1;
    }else{
        var nowTime=new Date().getTime()+3*60000;
    }
    var total_count=urls.length;
    var now_count=0;
    var percent=1;
    var interval_=req.query.interval*1
    if(interval_==1){
        percent=0.5
    }else if(interval_==2){
        percent=1
    }else if(interval_==3){
        percent=3;
    }else if(interval_==4){
        percent=4;
    }
    urls.forEach(function(url){
        zhua.zhua({
            url:url,
            userid:userid,
            url_reg:url_reg,
            pic_type:"images/jpg",
            pic_reg:pic_reg,
            content_reg:content_reg
        },function(data,error){
            if(error){
                return_error(error)
                return;
            }
            now_count++;
            
            if(percent<1){
                var time=new Date(nowTime+(now_count*percent)*60*60*1000);
                var now_minute=time.getMinutes()
                if(now_minute<=30&&now_minute>0){
                    time=time.getTime()+(30-now_minute)*60*1000-time.getSeconds()*1000;
                }else if(now_minute>30&&now_minute<60){
                    time=time.getTime()+(60-now_minute)*60*1000-time.getSeconds()*1000;
                }else{
                   time=time.getTime() 
                }
            }else{
                var time=new Date(nowTime+(now_count*percent)*60*60*1000);
                 time=time.getTime()-time.getMinutes()*60*1000-time.getSeconds()*1000;
            }
           
            sql.insert(config.table_queue,{
                wb_username:req.cookies.username,
                wb_id:userid,
                pic:data.pic,
                send_time:util.sqltime_to_displaytime(time),
                content:data.content
            },function(data,error){
                if(error){
                    errorHandle(5,error)
                    return;
                }
            })
            if(now_count>=total_count){
                res.render('zhua.html',{
                    data:'{"success":1}'
                });
            }
        })
    })
    
    
}

