/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var Canvas = require('canvas')
var fs=require("fs")
var config=require("./config.js").get();
var util=require("./util.js")
exports.handle=function(path,type,callback){
    fs.readFile(path, function(err, squid){
        if (err) {
            callback&&callback({},err)
            return;
        }
        img = new Canvas.Image;
        img.src = squid;
        var width=img.width;
        var height=img.height;
        var ctx_height=0;
        var begin_x=0;
        var to_x=420;
        if(width<=420){
            ctx_height=height+10;
            begin_x=210-width/2;
            to_x=width
        }else{
            ctx_height=420*height/width+10;
        }
        var canvas = new Canvas(440,ctx_height+82)
        , ctx = canvas.getContext('2d');
        ctx.fillStyle="#ffffff"
        ctx.fillRect(0,0,440,ctx_height)
        try{
            ctx.drawImage(img, 0,0,width,height,10+begin_x, 10, to_x, ctx_height-10);
        }catch(e){
            callback&&callback({},"do_pic drawimage error:"+e)
            return;
        }
        
        fs.readFile("tpl_bottom.png", function(err, squid2){
            if (err) {
                callback&&callback({},err)
                return;
            }
            var tpl_bottom_img=new Canvas.Image;
            tpl_bottom_img.src = squid2;
            try{
                ctx.drawImage(tpl_bottom_img, 0, ctx_height, 440, 82);
                var out = fs.createWriteStream(path)
                if(type=="image/png"){
                    var stream = canvas.createPNGStream();
                }else{
                    var stream = canvas.createJPEGStream({
                        quality : 80
                    });
                }
                stream.on('data', function(chunk){
                    out.write(chunk);
                });
                stream.on('end', function(){
                    callback&&callback.call(this)
                });
            }catch(e){
                callback&&callback({},"do_pic drawimage_bottom error:"+e)
                return;
            }
          
        });
    })
       
}