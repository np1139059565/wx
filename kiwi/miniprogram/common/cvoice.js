const aplugin = requirePlugin("WechatSI")
const VC = "voice"
var app, iacs//{ct111111:{time,iac,callback}}

module.exports.init = (_app) => {
    app = _app
    iacs={}

    module.exports.VC = VC
    module.exports.fplay=vplay
    module.exports.fstop=vstop
    module.exports.fplayInfo = playInfo
    module.exports.fdownTTSToLY = downTTSToLY

}


// play
function vplay(vpath, callback) {
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

function toTTS(tcontent, tlang, callback) {
    if (app.setts.network != true) {
        app.alog.lerror(null, "app.setts.network is false")
        if (typeof callback == "function") {
            callback(0)
        }
    }
    switch (tlang) {
        case "en":
            tlang = "en_US"
            break;
        default:
            tlang = "zh_CN"
    }
    wx.showLoading({
        title: 'to tts...',
        mask: true//防止触摸
    })
    aplugin.textToSpeech({
        lang: tlang,
        tts: true,
        content: tcontent,
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
            app.alog.lerror(res, "to tts is fail.")
            if (typeof callback == "function") {
                callback(0)
            }
        },
        complete: () => {
            wx.hideLoading()
        }
    })
}

//tts
function playInfo(info, playk, callback) {
    const vck = playk.endsWith(VC) ? playk : (playk + VC)
    const tpath = app.afile.fgetFtpath(info[vck])
    if (tpath != null) {
        vplay(tpath, callback)
    } else {
        downTTSToLY(info, playk, (code, tpath) => {
            if (code) {
                vplay(app.afile.fgetFtpath(tpath))
            }
            if (typeof callback == "function") {
                callback(code)
            }
        })
    }
}

//百度翻译 无法下载
function baiduTranslate(conter,langType,callback){
    const appid="20170510000046895"
    const  q=conter
    const toLang=langType
    const  salt="1435660288"
    const  appkey="Emy8QlH5ZIhWgbgmbvSL"
    const  hexmd5sign=app.md5.hexMD5(appid+q+salt+appkey)
    const url="http://api.fanyi.baidu.com/api/trans/vip/translate?q="+q+"&from=auto&to="+toLang+"&appid="+appid+"&salt="+salt+"&sign="+hexmd5sign
}

function downTTSToLY(info, playk, callback) {
    const playv=info[playk.split(VC)[0]]
    if(playk.startsWith("zh")){
        downZHToLY(info,playk,callback)
    }else{
        app.afile.fdownUrlToTmp("https://dict.youdao.com/dictvoice?audio=" + playv + "&type=1", null,(tcode, tpath) => {
            if (tcode) {
                const vck = playk.endsWith(VC) ? playk : (playk + VC)
                const skey = info[app.setts.key]
                const dstpath = app.setts.subid + "/" + VC + "/" + skey + "/" + vck
                app.afile.fsaveTmpFileToLY(tpath, dstpath, (scode, spath) => {
                    if (scode) {
                        info[vck] = spath
                        const skcode = skey.split("").map(_ => _.charCodeAt()).join("")
                        app.adatabase.dupdate(
                            {where: {_id: app.setts.subid}},
                            {
                                infos: {[skcode]: info},
                            },
                            (ucode) => {
                                if (typeof callback == "function") {
                                    callback(ucode)
                                }
                            }
                        )
                    }else if (typeof callback == "function") {
                        callback(scode)
                    }
                }, "mpga")
            } else if (typeof callback == "function") {
                callback(tcode)
            }
        })
    }
}
function downZHToLY(info, playk, callback){
    const playv=info[playk.split(VC)[0]]
    toTTS(playv,"zh-CN",(code,url)=>{
        app.ayun.yyun("downUrlFToYun",{url:url},(dcode,fdata)=>{
            if(dcode){
                const vck = playk.endsWith(VC) ? playk : (playk + VC)
                const skey = info[app.setts.key]
                const dstpath = app.setts.subid + "/" + VC + "/" + skey + "/" + vck
                const codepath=dstpath.split("/").map(d => d.split("").map(c => c.charCodeAt()).join("")).join("/")
                app.afile.fwriteToLocal(fdata,codepath,"mp3",(wcode,codepath)=>{
                    if(wcode){
                        app.afile.fsaveTmpFileToYun(app.afile.LOCAL_FTP+codepath,codepath,(scode,codepath)=>{
                            if(scode){
                                info[vck] = codepath
                                const skcode = skey.split("").map(_ => _.charCodeAt()).join("")
                                app.adatabase.dupdate(
                                    {where: {_id: app.setts.subid}},
                                    {
                                        infos: {[skcode]: info},
                                    },
                                    (ucode) => {
                                        if (typeof callback == "function") {
                                            callback(ucode)
                                        }
                                    }
                                )
                            }else if (typeof callback == "function") {
                                callback(scode)
                            }
                        })
                    }
                })
            }
        })
    })
}

