module.exports.init = (_app) => {
    app=_app
    app.units.logs.linfo("init cyun...")
    if (!wx.cloud) {
        app.units.logs.lerror(undefined, "请使用 2.2.3 或以上的基础库以使用云能力")
    }else{
        //init yun
        wx.cloud.init({
            // env 参数说明：
            //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
            //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
            //   如不填则使用默认环境（第一个创建的环境）
            env: 'yfwq1-4nvjm',
            traceUser: true,//将访问用户记录到云控制台的用户访问中
        })
        module.exports.fyun=yun1
    }
}

var app

/**
 *
 * @param name 云函数名 对应 ../cloudfunctions/*
 * @param data 合并入云函数的event
 * @param callback
 */
function yun1(name, data, callback){
    if(app.units.setts.fcache().network){
        wx.showLoading({
            title: 'yun...',
            mask:true//防止触摸
        })
        app.units.logs.linfo("yun...")
        wx.cloud.callFunction({
            name: name,//云函数名 对应 ../kiwi/cloudfunctions/*
            data: data,//合并入云函数的event
            success: res => {
                if (typeof callback == "function") {
                    callback(res.errMsg.endsWith(":ok") ? 1 : 0, res.result.data)
                }
            },
            fail: fe => {
                app.units.logs.lerror(fe,"cyun fail err.")
                if (typeof callback == "function") {
                    callback(0, {msg:fe})
                }
            },
            complete: () => {
                wx.hideLoading()
            }
        })
    }else{
        app.units.logs.lerror(null,"network is false")
        if(typeof callback=="function"){
            callback(0,{msg:"network is false"})
        }
    }
}