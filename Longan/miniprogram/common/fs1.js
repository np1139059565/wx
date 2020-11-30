module.exports.init = (_app) => {
    app=_app
    app.units.logs.linfo("init fs...")
    module.exports.freadUTF8=readUTF8
    module.exports.fwriteUTF8=writeUTF8
}

var app
const LOCAL_MAX=200//MB
const FSM=wx.getFileSystemManager()
const LOCAL_FTP = wx.env.USER_DATA_PATH + "/FILES/"
function readUTF8(fpath,callback){
    wx.showLoading({
        title: 'read...',
        mask:true//防止触摸
    })
    FSM.readFile({
        filePath:LOCAL_FTP+fpath,
        encoding:"utf-8",
        complete: res=>{
            wx.hideLoading()
            okcallback(res,(code,ores)=>{
                if(typeof callback=="function"){
                    callback(code,ores.data)//res.data is str
                }
            })
        }
    })
}
function writeUTF8(fpath,str,callback){
    wx.showLoading({
        title: 'write...',
        mask:true//防止触摸
    })
    ccdir(LOCAL_FTP+fpath,(code)=>{
        if(code){
            FSM.writeFile({
                filePath:LOCAL_FTP+fpath,
                encoding:"utf-8",//binary
                data:str,
                complete: res=>{
                    wx.hideLoading()
                    okcallback(res,(wcode,ores)=>{
                        if(typeof callback=="function"){
                            callback(wcode,ores.data)//res.data is str
                        }
                    })
                }
            })
        }
    })
}
function ccdir(fpath, callback) {
    const dirPath = fpath.split("/").reverse().filter((p, i) => (i > 0)).reverse().join("/")
    FSM.access({
        path: dirPath,
        complete: (sres) => {
            okcallback(sres, (acode) => {
                if (acode) {
                    if(typeof callback=="function"){
                        callback(acode)
                    }
                } else {
                    FSM.mkdir({
                        dirPath: dirPath,
                        recursive: true,
                        complete: (mres) => {
                            okcallback(mres, (mcode)=>{
                                app.units.logs.linfo("mkdir "+dirPath+" is " + mcode)
                                if(typeof callback=="function"){
                                    callback(mcode)
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}
function okcallback(res,callback){
    try {
        const code = (res.errMsg.endsWith(":ok"))
        if (!code) {
            app.units.logs.lerror(res,"cfile default callback")
        }
        if (typeof callback == "function") {
            callback(code, res)
        } else {
            app.uts.logs.linfo("cfile default callback")
        }
    } catch (e) {
        app.units.logs.lerror(e)
    }
}