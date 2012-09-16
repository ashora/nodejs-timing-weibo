var config=require("./config.js").get();
var util=require("./util.js");
var Client = require('mysql').Client;
var sql={
    select:function(where,condition,callback){
        var client = new Client();
        client.user = config.sql_username;  
        client.password =config.sql_password;  
        client.query('USE '+config.sql_table);  
        client.query(  
            'SELECT * FROM '+where+' '+condition,  
            function selectCb(err, results, fields) {  
                if (err) {
                    callback({},err)
                    return;
                }
                callback(results)
                client.end()
            });
    },
    insert:function(where,data,callback){
        //将用户的consumerkey和consumersecret存储到数据库，在后台可以直接用这两个信息发送微博，无需用户参与。
        var client = new Client();
        //用户名  
        client.user = config.sql_username;  
        //密码  
        client.password =config.sql_password;  
        
        client.query('USE '+config.sql_table);  
        var sql_query='INSERT INTO '+where+' SET '
        var sql_key=[]
        var sql_value=[]
        for(var i in data){
            sql_key.push(i+"=?")
            sql_value.push(data[i])
        }
        sql_query+=sql_key.join(",")
        client.query(sql_query,sql_value);  
        client.end()
    },
    del:function(where,check_key,check_value){
        var client = new Client();
        client.user =  config.sql_username;  
        client.password =config.sql_password;  
        client.query('USE '+config.sql_table);  
        client.query(  
            'DELETE FROM  '+where+  
            ' WHERE '+check_key+' = "'+check_value+'" ');
        client.end();
    },
    insert_update:function(where,data,check_key,check_value,callback){
        //将用户的consumerkey和consumersecret存储到数据库，在后台可以直接用这两个信息发送微博，无需用户参与。
        var client = new Client();
        //用户名  
        client.user = config.sql_username;  
        //密码  
        client.password =config.sql_password;  
        
        client.query('USE '+config.sql_table);  
        client.query(  
            'SELECT COUNT('+check_key+') FROM '+where+' where '+check_key+'="'+check_value+'"',  
            function selectCb(err, results, fields) {  
                if (err) {  
                    callback({},err)
                }  
                if(results[0]['COUNT('+check_key+')']==0){
                    var sql_query='INSERT INTO '+where+' SET '
                    var sql_key=[]
                    var sql_value=[]
                    for(var i in data){
                        sql_key.push(i+"=?")
                        sql_value.push(data[i])
                    }
                    sql_query+=sql_key.join(",")
                    client.query(sql_query,sql_value);  
                }else{
                    var sql_query='UPDATE '+where+' SET '
                    var sql_key=[]
                    var sql_value=[]
                    for(var i in data){
                        sql_key.push(i+"=?")
                        sql_value.push(data[i])
                    }
                    sql_query+=sql_key.join(",")
                    sql_query+=" WHERE "+check_key+'="'+check_value+'"'
                    client.query(sql_query,sql_value);  
                }
                //关闭数据库连接
                client.end();
            });  
    }
}


for(var i in sql){
    exports[i]=sql[i]
}
