var config=require("./config.js").get();
var util=require("./util.js");
var sql=require("./sql.js");
var wb = require('../lib/weibo-v2.js').WeiboApi;
var opts = {
    app_key       :  config.weibo_key ,
    app_secret    :  config.weibo_secret ,
    redirect_uri : 'http://'+config.host+':'+config.run_port+'/sina_auth_cb'
};
exports.auth=function(req, res,next) {
    var api = new wb(opts);
    var auth_url = api.getAuthorizeUrl({
        redirect_uri : 'http://'+req.host+':'+config.run_port+'/sina_auth_cb'
    });
    util.log_process("create auth_url :"+auth_url)
    res.redirect(auth_url);
    res.end();    
}
exports.sina_auth_cb = function(req, res, query_info) {
    var code = req.query.code;
    if(!code) {
        res.redirect('/?error=授权失败，请重试！（code获取失败）');
        return;
    };
    var api = new wb(opts);
    api.accessToken({
        code : code
    },function(data) {
        if(util.wb_error(data)){
            res.redirect('/?error=授权失败，请重试！（'+data.error+'）');
            return;
        }
        var access_token=data.access_token;
        var uid=data.uid;
        //获取用户完整信息
        api.users.show({
            uid:uid,
            access_token:access_token
        },function(d){
            if(util.wb_error(d)){
                res.redirect('/?error=授权失败，请重试！（'+d.error+'）');
                return;
            }
            var user=d;
            util.log_process(user.id+": oauth success! ")
            //将用户id和用户名存储到cookie，下次无需认证直接可以使用。
            res.cookie("userid", user.id,{
                expires: new Date(Date.now() + config.cookie_expire_time), 
                httpOnly: true
            });
            res.cookie("username", user.name,{
                expires: new Date(Date.now() + config.cookie_expire_time), 
                httpOnly: true
            });
            sql.insert_update(config.table_user,{
                wb_username:user.name,
                wb_accesstoken:access_token,
                wb_id:user.id
            },"wb_id",user.id,function(data,error){
                if(error){
                    util.log_error(user.id+":"+error)
                    res.redirect('/?error=授权失败，请重试！');
                    return;
                }
            })
            util.log_process(user.id+": insert success name:"+user.name+" token:"+access_token)
            //认证成功跳转到oauth页面
            res.redirect('oauth');
        })
    //  req.session.oauthUser=JSON.parse(data)
       
    }
    );
//  res.end()
}