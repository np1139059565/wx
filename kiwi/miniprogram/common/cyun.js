var app
module.exports.init=(_app)=>{
    app=_app
    // check is yun
    if (!wx.cloud) {
        app.alog.lerror(undefined, "请使用 2.2.3 或以上的基础库以使用云能力")
    } else {
        //init yun
        wx.cloud.init({
            // env 参数说明：
            //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
            //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
            //   如不填则使用默认环境（第一个创建的环境）
            env: 'yfwq1-4nvjm',
            traceUser: true,//将访问用户记录到云控制台的用户访问中
        })
        module.exports.yyun =  (name, data, callback) =>{
            wx.showLoading({
                title: 'yun...',
                mask:true//防止触摸
            })
            app.alog.linfo("cyun...")
            wx.cloud.callFunction({
                name: name,//云函数名 对应 ../kiwi/cloudfunctions/*
                data: data,//合并入云函数的event
                success: res => {
                    try{
                        if (typeof callback == "function") {
                            callback(res.result.code == 0 ? 0 : 1, res.result)
                        }
                    }catch (e) {
                        app.alog.lerror(e,"cyun success err.")
                    }
                },
                fail: e => {
                    try{
                        app.alog.lerror(e,"cyun fail err.")
                        if (typeof callback == "function") {
                            callback(0, {msg:e})
                        }
                    }catch (e1) {
                        app.alog.lerror(e1,"cyun fail err.")
                    }
                },
                complete: () => {
                    wx.hideLoading()
                }
            })
        }
    }
}
