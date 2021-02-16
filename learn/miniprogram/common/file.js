module.exports.init=(log1)=>{
    log=log1
    info("init file...")
    const userdir=wx.env.USER_DATA_PATH
    module.exports.udir=userdir
    info("user dir:"+userdir)
    fsm=wx.getFileSystemManager()
    module.exports.readdir=rd
    module.exports.readfile=rf
    module.exports.writefile=wf
    module.exports.getinfo=gi
    module.exports.isExist=ie
    module.exports.rmPath=rp
    module.exports.downYunFile=dyfSync
    info("file init is end.")
}

var log=null

function info(inf1,inf2,inf3,inf4){
    if(log==null){
        console.info(inf1,inf2,inf3,inf4)
    }else log.info(inf1,inf2,inf3,inf4)
}
function err(e1,e2,e3,e4){
    if(log==null){
        console.error(e1,e2,e3,e4)
    }else log.err(e1,e2,e3,e4)
}







var fsm=null
/**
 *
 * @param dPath /:代码包文件 ../learn/miniprogram
 */
function rd(dPath){
    // fsm.readdir({
    //     dirPath:dirPath,
    //     complete:(r)=>{
    //         //r:{errMsg,files:[]}
    //         errMsgToCode(r,callback)
    //     }
    // })

    try{
        return fsm.readdirSync(dPath)//[p1,p2]
    }catch (e){
        return err(e)
    }
}
function rf(fpath){
    try{
        return fsm.readFileSync(fpath,"UTF-8")
    }catch (e){
        return err(e)
    }
}
function wf(fpath,data){
    try{
        const ppath=fpath.substr(0,fpath.lastIndexOf("/"))
        if((ie(ppath)==true&&gi(ppath).isDirectory())==false)
            mk(ppath)
        info("write file:"+fpath)
        return fsm.writeFileSync(fpath,data,"utf8")
    }catch (e){
        return err(e)
    }
}

/**
 *
 * @param path
 * @returns {void|*} Stats:
 * .mode:
 * .size:
 * .lastAccessedTime:
 * .lastModifiedTime:
 * .isDirectory() 判断当前文件是否一个目录
 * .isFile() 判断当前文件是否一个文件
 */
function gi(path){
    try{
        return fsm.statSync(path,false)
    }catch (e){
        return err(e)
    }
}
function ie(path){
    try{
        return fsm.accessSync(path)==null
    }catch (e){
        if(e.message.indexOf("no such file or directory")){
            info(e.message)
        }else err(e)
        return false
    }
}
function rp(path){
    try{
        if(ie(path)){
            const stat=gi(path)
            if(stat.isDirectory()){
                info("rm dir:"+path)
                return fsm.rmdirSync(path,true)==null
            }else {
                info("rm file:"+path)
                return fsm.unlinkSync(path) == null
            }
        }else{
            info("rm is success:path is not find.")
            return true
        }
    }catch (e){
        return err(e)
    }
}
function mk(dpath){
    try{
        if(ie(dpath)==false){
            info("mkdir:"+dpath)
            fsm.mkdirSync(dpath,true)
        }else info("file already exists")

    }catch (e){
        err(e)
    }
}

/**
 *
 * @param ypath
 * @param fpath dst file path
 * @param callback
 */
function dyfSync(ypath,fpath,callback){
    wx.showLoading({
        title: "down...",
        mask: true//防止触摸
    })
    wx.cloud.downloadFile({
        fileID: ypath,
        complete: (res) => {
            try{
                wx.hideLoading()
                const code=res.errMsg.endsWith(":ok")
                info("download yun file:"+ypath+" to temp is "+code)
                if(code){
                    const ppath=fpath.substr(0,fpath.lastIndexOf("/"))
                    if((ie(ppath)==true&&gi(ppath).isDirectory())==false)
                        mk(ppath)
                    const ccode=fsm.copyFileSync(res.tempFilePath,fpath)==null
                    info("copy tmp file:"+res.tempFilePath+" to "+fpath+" is "+ccode)
                    callback(ccode)
                }else if (typeof callback == "function") {
                    callback(code)
                }
            }catch (e){
                err(e)
                callback(false)
            }
        }
    })
}


function errMsgToCode(res,callback){
    callback(res.errMsg.endsWith(":ok"),res)
}

