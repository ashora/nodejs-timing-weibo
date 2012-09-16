var path=require("path")
var fs=require("fs")
var url=require("url")
exports.server=function(req,res){
    var mime= {
        "css": "text/css",
        "gif": "image/gif",
        "html": "text/html",
        "ico": "image/x-icon",
        "jpeg": "image/jpeg",
        "jpg": "image/jpeg",
        "js": "text/javascript",
        "json": "application/json",
        "pdf": "application/pdf",
        "png": "image/png",
        "svg": "image/svg+xml",
        "swf": "application/x-shockwave-flash",
        "tiff": "image/tiff",
        "txt": "text/plain",
        "wav": "audio/x-wav",
        "wma": "audio/x-ms-wma",
        "wmv": "video/x-ms-wmv",
        "xml": "text/xml"
    };
    var realPath = "."+url.parse(req.url).pathname;
    var ext = path.extname(realPath);
    ext = ext ? ext.slice(1) : 'unknown';
    var contentType = mime[ext] || "text/plain";
    path.exists(realPath, function (exists) {
        if (!exists) {
            console.log("404 request to"+realPath)
            res.writeHead(404, {
                'Content-Type': contentType
            });
            res.write("This request URL " + realPath + " was not found on this server.");
            res.end();
        } else {
            fs.readFile(realPath, "binary", function (err, file) {
                if (err) { 
                    console.log(err)
                    res.writeHead(500, {
                        'Content-Type': contentType
                    });
                    res.end(err);
                } else {
                    res.writeHead(200, {
                        'Content-Type': contentType
                    });
                    res.write(file, "binary");
                    res.end();
                }
            });
        }
    });
}