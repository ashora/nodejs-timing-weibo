
var config=require("./config.js").get();
var util={
    log_process:function(info){
        config.log_process&&console.log(info)
    },
    log_error:function(info){
        console.log(info)
    },
    wb_error:function(data){
        if(data.error_code){
            this.log_error("request:"+data.request+" error:"+data.error +" code:"+data.error_code) 
            return true;
        }else{
            return false;
        }
    },
    sqltime_to_displaytime:function(sqltime){
        var time=new Date(sqltime);
        return time.getFullYear()+"-"+(time.getMonth()+1)+"-"+time.getDate()+
        " "+time.getHours()+":"+time.getMinutes()+":"+time.getSeconds();
    },
    mix:function(target,source){
        for(var i in source){
            target[i]=source[i]
        }
    }
}

for(var i in util){
    exports[i]=util[i]
}