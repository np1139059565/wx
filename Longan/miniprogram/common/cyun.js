var app,isInit=false
function initYun(lerr){
    if (!wx.cloud) {
        lerr(undefined, "请使用 2.2.3 或以上的基础库以使用云能力")
    }else{
        //init yun
        isInit=true
        wx.cloud.init({
            // env 参数说明：
            //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
            //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
            //   如不填则使用默认环境（第一个创建的环境）
            env: 'yfwq1-4nvjm',
            traceUser: true,//将访问用户记录到云控制台的用户访问中
        })
    }
}
/**
 *
 * @param name 云函数名 对应 ../cloudfunctions/*
 * @param data 合并入云函数的event
 * @param callback
 */
function yun1(name, data, callback){
    wx.showLoading({
        title: 'yun...',
        mask:true//防止触摸
    })
    app.utils.logs.linfo("yun...")
    wx.cloud.callFunction({
        name: name,//云函数名 对应 ../kiwi/cloudfunctions/*
        data: data,//合并入云函数的event
        success: res => {
            if (typeof callback == "function") {
                const code=(res.errMsg.endsWith(":ok")&&res.result.code!=0 ? 1 : 0)
                if(!code){
                    app.utils.logs.lerror(res.result.errMsg)
                }
                callback(code, res.result.data)
            }
        },
        fail: fe => {
            app.utils.logs.lerror(fe,"cyun fail err.")
            if (typeof callback == "function") {
                callback(0, {errMsg:fe})
            }
        },
        complete: () => {
            wx.hideLoading()
        }
    })
}

module.exports.init = (_app,callback) => {
    app=_app
    app.utils.logs.linfo("init cyun...")
    if(!isInit){
        initYun(app.utils.logs.lerror)
    }
    module.exports.fyun=(name, data, callback)=>{
        if(app.utils.setts.fcache().network){
            yun1(name, data, callback)
        }else{
            app.utils.logs.lerror(null,"network is false")
            if(typeof callback=="function"){
                callback(0,{errMsg:"network is false"})
            }
        }
    }
    callback(1)
}
module.exports.fyun=yun1
initYun(console.error)