var fs=require("fs")
var config=require("./config.js").get();
var util=require("./util.js")
var sql=require("./sql.js")
var do_pic=require("./do_pic.js")
exports.post=function(req, res) {
    var userid=req.cookies.userid
    var username=req.cookies.username;
    var content=req.body.wb_content;
    //获得图片文件的临时路径
    var tmp_path = req.files['wb_pic'].path;
    var size=req.files['wb_pic'].size
    var time=req.body.wb_year+"-"+req.body.wb_month+"-"+req.body.wb_day+" "+
    req.body.wb_hour+":"+req.body.wb_minute+":"+req.body.wb_second;
    var target_path = './images/'+(new Date().getTime()) +"-"+parseInt(Math.random()*100000000)+"-"+ req.files['wb_pic'].name.replace(/[\u4e00-\u9fa5]/g,"");
    var errorHandle=function(error_code,error){
        var info,log
        switch(error_code){
            case 1:
                info="图片大小超过5M，提交失败！";
                break;
            case 2:
                info="图片格式不是png，jpg，gif，提交失败！";
                break;
            case 3:
                info="图片上传失败！";
                log="post /list upload image(rename) error:";
                break;
            case 4:
                info="图片上传失败！";
                log="post /list upload image(unlink) error:";
                break;
            case 5:
                info="添加失败！";
                log="post /list insert queue error:";
                break;
            case 6:
                info="图片处理失败！";
                log="post /list do_pic  handle images error:";
                break;
        }
        log&&util.log_error(userid+": "+log+error)
        req.session.list_error=info
        req.method = 'get'; 
        res.redirect('/list');
    }
    if(size>0){
        var type=req.files['wb_pic'].type
        if(size>5000000){
            errorHandle(1)
            return;
        }else if(!(type=="image/png"||type=="image/jpg"||type=="image/jpeg"||type=="image/gif")){
            errorHandle(2)
            return;
        }else{
            req.session.list_error=""
        }
        util.log_process(userid+": post /list begin rename:unlink:"+tmp_path+" to:"+target_path)
        // 移动文件
        fs.rename(tmp_path, target_path, function(err) {
            if (err) {
                errorHandle(3,err)
                return;
            } 
            // 删除临时文件夹文件, 
            fs.unlink(tmp_path, function() {
                if (err) {
                    errorHandle(4,err)
                    return;
                } 
                util.log_process(userid+": post /list upload image success"+target_path)
                //开始处理图片
                if(req.body.no_do_handle||type=="image/gif"){
                    //如果强制不处理或者是gif，则直接添加到计划中
                    sql.insert(config.table_queue,{
                        wb_username:username,
                        wb_id:userid,
                        pic:target_path,
                        send_time:time,
                        content:content
                    },function(data,error){
                        if(error){
                            errorHandle(5,error)
                            return;
                        }
                    })
                    req.method = 'get'; 
                    res.redirect('/list'); 
                }else{
                    //开始添加水印
                    do_pic.handle(target_path,type,function(data,error){
                        if(error){
                            errorHandle(6,error)
                            return;
                        }
                        util.log_process(userid+": post /list  join images success"+target_path)
                        sql.insert(config.table_queue,{
                            wb_username:username,
                            wb_id:userid,
                            pic:target_path,
                            send_time:time,
                            content:content
                        },function(data,error){
                            if(error){
                                errorHandle(5,error)
                                return;
                            }
                        })
                        req.method = 'get'; 
                        res.redirect('/list'); 
                    })
                }
            });
        });
    }else if(req.body.online_pic){
        util.log_process(userid+": begin insert onlinepic queque content:"+content)
        sql.insert(config.table_queue,{
            wb_username:username,
            wb_id:userid,
            pic:req.body.online_pic,
            send_time:time,
            content:content
        },function(data,error){
            if(error){
                errorHandle(5,error)
                return;
            }
        })
        req.method = 'get'; 
        res.redirect('/list'); 
    }else{
        util.log_process(userid+": begin insert text queque content:"+content)
        sql.insert(config.table_queue,{
            wb_username:username,
            wb_id:userid,
            pic:"",
            send_time:time,
            content:content
        },function(data,error){
            if(error){
                errorHandle(5,error)
                return;
            }
          
        })
        req.method = 'get'; 
        res.redirect('/list'); 
    }
}


