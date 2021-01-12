module.exports.init = (_app,callback) => {
    app=_app
    app.utils.logs.linfo("init voice...")
    module.exports.fdownTTS=downTTS
    module.exports.fvplay=vplay
    callback(1)
}

const VC = "voice"
const aplugin = requirePlugin("WechatSI")
var app,iacs={}//{ct111111:{time,iac,callback}}
function strToTTS(str,toLang,callback){
    if (app.utils.setts.fcache().network != true) {
        app.utils.logs.lerror(null, "network is false")
        if (typeof callback == "function") {
            callback(0)
        }
    } else {
        wx.showLoading({
            title: 'to tts...',
            mask: true//防止触摸
        })
        switch (toLang) {
            case "en":
                toLang = "en_US"
                break;
            default:
                toLang = "zh_CN"
        }
        aplugin.textToSpeech({
            lang: toLang,
            tts: true,
            content: str,
            success: (res) => {
                //{expired_time: 1604594472
                // filename: "https://ae.weixin.qq.com/cgi-bin/mmasrai-bin/getmedia?filename=1604583675_7bdd6baf1dce5ce32a0627e70a8721a1&filekey=105816812&source=miniapp_plugin"
                // origin: "survey"
                // retcode: 0}
                if (typeof callback == "function") {
                    callback(1, res.filename)
                }
            },
            fail: (res) => {
                //{msg: "please check out language option."
                // retcode: -20001}
                app.utils.logs.lerror(res, "to tts is fail.")
                if (typeof callback == "function") {
                    callback(0)
                }
            },
            complete: () => {
                wx.hideLoading()
            }
        })
    }
}
/**
 *
 * @param info
 * @param strkey
 * @param kcode
 * @param callback
 */
function downTTS(info,vkey,kcode,callback){
    //to vkey envoice,zhvoice
    if (!vkey.endsWith(VC)) {
        vkey += VC
    }
    const strkey=vkey.split(VC)[0]
    const dstpath =  VC + "/" + kcode + "/" + strkey
    if(strkey=="zh"){
        downZH(info[strkey],vkey,dstpath,kcode,callback)
    }else{
        app.utils.fs.fdownUrl("https://dict.youdao.com/dictvoice?audio=" + info[strkey] + "&type=1", dstpath+".mpga",(dcode) => {
            if(dcode){
                // app.utils.db.
                // app.utils.db.
                saveTTS(kcode,vkey,dstpath+".mp3",callback)
            }
        })
    }
}
function downZH(str,vkey,dstpath,kcode,callback){
    strToTTS(str,"zh",(code,turl)=>{
        app.utils.fs.fdownUrl(turl, dstpath+".mp3",(dcode) => {
            if(dcode){
                // app.utils.db.
                saveTTS(kcode,vkey,dstpath+".mp3",callback)
            }
        })
    })
}
function saveTTS(kcode,vkey,dstpath,callback){
    app.utils.db.fupdate({infos:{[kcode]: {[vkey]:dstpath}}},(ucode)=>{
        if(typeof callback=="function"){
            callback(ucode)
        }
    })
}

function vplay(info,vkey, callback) {
    //to vkey
    if(!vkey.endsWith(VC)){
        vkey+=VC
    }
    const vpath=app.utils.fs.fgetFtp(info[vkey])
    const ctime=new Date().getTime()
    const iac=wx.createInnerAudioContext()
    iac.src = vpath
    //end
    iac.onEnded((res,ct1=ctime) => {
        iacs["ct"+ct1].callback(1)
    })
    //err
    iac.onError((res,ct1=ctime) => {
        app.alog.lerror(res, "player voice is fail.")
        iacs["ct"+ct1].callback(0)
    })
    //stop all
    for(const k in iacs){
        vstop(iacs[k].ctime)
    }
    //push to iacs
    iacs["ct"+ctime]={
        ctime:ctime,
        iac : iac,
        callback:(code,cb=callback,iac1=iac,time1=ctime)=>{
            if(typeof cb=="function"){
                try{
                    cb(code)
                }catch (e) {
                    app.alog.lerror(e,"vplay callback is fail.")
                }
            }
            iac1.destroy()
            delete iacs["ct"+time1]
        }
    }
    iac.play()
    return ctime
}
function vstop(ctime){
    if(iacs["ct"+ctime]!=null){
        iacs["ct"+ctime].callback(1)
    }
}