module.exports.init = (_app,callback) => {
    app=_app
    app.utils.logs.linfo("init fs...")
    module.exports.freadUTF8=readUTF8
    module.exports.fwriteUTF8=writeUTF8
    module.exports.fstat=stat1
    module.exports.fexist=exist1
    module.exports.fdownYun=downYun
    module.exports.fdownUrl=downUrl
    module.exports.fdel=delLocalFile
    module.exports.fgetFtp=getFtp
    callback(1)
}

var app
const LOCAL_MAX=200//MB
const FSM=wx.getFileSystemManager()
const LOCAL_FTP = wx.env.USER_DATA_PATH + "/FILES/"
const YUN_FTP = "cloud://yfwq1-4nvjm.7966-yfwq1-4nvjm-1302064482/"
function okcallback(res,callback){
    try {
        const code = (res.errMsg.endsWith(":ok"))
        if (!code) {
            app.utils.logs.lerror(res,"cfile default callback")
        }
        if (typeof callback == "function") {
            callback(code, res)
        } else {
            app.uts.logs.linfo("cfile default callback")
        }
    } catch (e) {
        app.utils.logs.lerror(e)
    }
}
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
    ccdir(fpath,(code)=>{
        if(code){
            const lpath=LOCAL_FTP+fpath
            FSM.writeFile({
                filePath:lpath,
                encoding:"utf-8",//binary
                data:str,
                complete: res=>{
                    wx.hideLoading()
                    okcallback(res,(wcode,ores)=>{
                        app.utils.logs.linfo("write "+lpath+" is "+wcode)
                        if(typeof callback=="function"){
                            callback(wcode,ores.data)//res.data is str
                        }
                    })
                }
            })
        }
    },true)
}
function exist1(fpath,callback){
    FSM.access({
        path: LOCAL_FTP+fpath,
        complete: (sres) => {
            if(sres.errMsg.endsWith(":ok")){
                app.utils.logs.linfo(LOCAL_FTP+fpath+" is exist.")
                callback(1)
            }else callback(0)
        }
    })
}
function stat1(fpath,callback){
    FSM.stat({
        path: LOCAL_FTP+fpath,
        complete: (sres) => {
            if(sres.errMsg.endsWith(":ok")){
                callback(1,sres.stats)//stats:{size,isFile(),isDirectory()}
            }else callback(0)
        }
    })
}
function ccdir(fpath, callback,isCreate) {
    const dirPath = fpath.split("/").reverse().filter((p, i) => (i > 0)).reverse().join("/")
    exist1(dirPath,(ecode)=>{
        if(ecode){
            callback(1)
        }else{
            if(isCreate){
                FSM.mkdir({
                    dirPath: LOCAL_FTP+dirPath,
                    recursive: true,
                    complete: (mres) => {
                        okcallback(mres, (mcode)=>{
                            app.utils.logs.linfo("mkdir "+dirPath+" is " + mcode)
                            if(typeof callback=="function"){
                                callback(mcode)
                            }
                        })
                    }
                })
            }else if(typeof callback=="function"){
                callback(0)
            }
        }
    })
}
function downYun(srcpath,dstpath,callback){
    if (app.utils.setts.fcache().network != true) {
        app.utils.logs.lerror(null, "network is false")
        if (typeof callback == "function") {
            callback(0)
        }
    } else {
        const ypath = YUN_FTP + srcpath
        const msg = "down " + ypath + " by yun to tmp..."
        app.utils.logs.linfo(msg)
        wx.showLoading({
            title: msg,
            mask: true//防止触摸
        })
        wx.cloud.downloadFile({
            fileID: ypath,
            complete: (res) => {
                wx.hideLoading()
                okcallback(res, (code) => {
                    app.utils.logs.linfo("down "+ypath+" is "+code)
                    if(code){
                        copyTmpFileToLocal(res.tempFilePath,dstpath,callback)
                    }else if (typeof callback == "function") {
                        callback(code)
                    }
                })
            }
        })
    }
}
function downUrl(url,dstpath,callback){
    if (app.utils.setts.fcache().network != true) {
        app.utils.logs.lerror(null, "network is false")
        if (typeof callback == "function") {
            callback(0)
        }
    } else {
        app.utils.logs.linfo("down " + url)
        wx.showLoading({
            title: "down...",
            mask: true//防止触摸
        })
        wx.downloadFile({
            url: url,
            complete: (res) => {
                wx.hideLoading()
                okcallback(res, (code) => {
                    app.utils.logs.linfo("down "+url+" is "+code)
                    if(code){
                        copyTmpFileToLocal(res.tempFilePath,dstpath,callback)
                    }else if (typeof callback == "function") {
                        callback(code)
                    }
                })
            }
        })
    }
}
function copyTmpFileToLocal(tempFilePath, dstpath, callback) {
    const lpath=LOCAL_FTP+dstpath
    ccdir(dstpath, (ccode) => {
        if (ccode) {
            FSM.copyFile({
                srcPath: tempFilePath,
                destPath: lpath,
                complete: (cres) => {
                    okcallback(cres, (code) => {
                        app.utils.logs.linfo("copy " + tempFilePath +" to "+lpath+ " is " + code)
                        if (typeof callback == "function") {
                            callback(code)
                        }
                    })
                }
            })
        } else if (typeof callback == "function") {
            callback(ccode)
        }
    },true)
}
function delLocalFile(fpath,callback){
    stat1(fpath,(scode,status)=>{
        if(scode){
            if(status.isFile()){
                FSM.unlink({
                    filePath: LOCAL_FTP+fpath,
                    complete: (res) => {
                        okcallback(res, (ucode) => {
                            app.utils.logs.linfo("del "+LOCAL_FTP+fpath+" is "+ucode)
                            if (typeof callback == "function") {
                                callback(ucode)
                            }
                        })
                    }
                })
            }else {
                FSM.rmdir({
                    dirPath: LOCAL_FTP+fpath,
                    recursive:true,
                    complete: (res) => {
                        okcallback(res, (code) => {
                            app.utils.logs.linfo("del "+LOCAL_FTP+fpath+" is "+code)
                            if (typeof callback == "function") {
                                callback(code)
                            }
                        })
                    }
                })
            }
        }else {
            //找不到代表删除成功
            app.utils.logs.linfo((LOCAL_FTP+fpath)+" is not find.")
            if (typeof callback == "function") {
                callback(1)
            }
        }
    })
}
function getFtp(path){
    const ftpath = LOCAL_FTP + path
    app.utils.logs.linfo("get ftp path:" + ftpath)
    return ftpath
}