
var config=require("./config.js").get();
var util=require("./util.js")
var readOF=require("readof")
var do_pic=require("./do_pic.js")
var sql=require("./sql.js")
var http=require("http")
var wb = require('weibov2').WeiboApi;
exports.zhua=function(_config,callback){
    var self_config={
        url:"",
        path: "",
        method: 'GET',
        post_data:"",
        pic_type:"image/jpg",
        pic_reg:/<div id="bdshare" class=".*?" data="{'text':'.*?', 'pic':'(.*?)' ,/,
        content_reg:/<div id="bdshare" class=".*?" data="{'text':'(.*?)', 'pic':'.*?' ,/
    }
    util.mix(self_config,_config)
    var match=self_config.url.match(self_config.url_reg)
    if(!match){
        callback({},"url not match:"+self_config.url)
        return;
    }
    var option= {
        host: match[1],
        port: 80,
        path: match[2],
        method: 'GET',
        headers:{
            'Content-Length':self_config.post_data.length,
            'Content-Type':'application/x-www-form-urlencoded',
            'Accept-Charset':'utf-8;q=0.7,*;q=0.3'
        }
    }
    var userid=self_config.userid
    var req = http.request(option, function(res) {
        var str=""
        //res.setEncoding('utf-8');
        res.on('data', function (chunk) {
            str+=chunk
        });
        res.on("end",function(){
            var data=str
            var result=""
            var pic_match=data.match(self_config.pic_reg)
            var content_match=data.match(self_config.content_reg)
            if(!pic_match){
                callback({},"picurl no match")
                return;
            }
            if(!content_match){
                callback({},"content no match")
                return;
            }
            var pic=pic_match[1]
            var content=content_match[1]
            var target_path = './images/'+(new Date().getTime()) +"-"+parseInt(Math.random()*100000000)+ ".jpg";
            readOF.read(pic,target_path,function(data,error){
                if(error){
                    callback({},error)
                    return;
                }
                //开始添加水印
                do_pic.handle(target_path,self_config.pic_type,function(data,error){
                    if(error){
                        callback({},error)
                        return;
                    }
                    util.log_process(userid+": post /list  join images success"+target_path)
                    sql.select(config.table_user," where wb_id="+userid,function(data,error){
                        if(error){
                            callback({},error)
                            return;
                        }
                        if((!data)||(!data.length)){
                            callback({},"no found user")
                            return;
                        }
                        token=data[0].wb_accesstoken;
                        var url=self_config.url;
                        var api = new wb( {
                            app_key       :  config.weibo_key ,
                            app_secret    :  config.weibo_secret 
                        });
                        var http_reg=new RegExp("(http:\\/\\/([\\w-]+\\.)+[\\w-]+(\\/[\\w- ./?%&=]*)?)","g")
                        var option={
                            access_token:token,
                            url_long:url
                        }
                        api.statuses.shorten(option,function(_d){
                            if(util.wb_error(_d)){
                                util.log_error(userid+": shorten url error:"+_d)
                            }else{
                                if(_d.urls){
                                    for(var i=0;i<_d.urls.length;i++){
                                        url=_d.urls[i].url_short
                                    }
                                }
                            }
                            callback({
                                pic:target_path,
                                content:content.substr(0,140-url.length-7)+' '+url+' 来自@想去'
                            })
                        })
                    })
                })
            })
        })
        res.on("close",function(error){
            callback({},error)
        })
    })
    req.write(self_config.post_data + "\n");
    req.end();
}

