var config={
    "weibo_key":0,
    "weibo_secret":"0",
    "run_port":8111,
    "sql_username":"*",
    "sql_password":"*",
    "sql_table":"common_wb",
    "env":"online",
    "is_updating":false,
    "log_process":true,
    "cookie_expire_time":604800000,
    "table_user":"wb_id",
    "table_queue":"wb_queue",
    "host":"wbtool.xiangqu.com"
}
exports.get=function(){
    return config;
}

