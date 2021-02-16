module.exports.init=(log1)=>{
    log=log1
    info("init yun...")
    if (!wx.cloud) {
        err("请使用 2.2.3 或以上的基础库以使用云能力")
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
        module.exports.yunSync=yunSync1
        info("init yun is end.")
    }
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

/**
 *
 * @param eventName 云函数名 对应 ../appname/cloudfunctions/*
 * @param data 合并入云函数的event
 * @param callback
 */
function yunSync1(eventName, data, callback){
    wx.showLoading({
        title: 'yun...',
        mask:true//防止触摸
    })
    info("yun...")
    var res=null
    wx.cloud.callFunction({
        name: eventName,//云函数名 对应 ../appname/cloudfunctions/*
        data: data,//合并入云函数的event 如果包含大数据字段（建议临界值 256KB）建议使用 wx.cloud.CDN 标记大数据字段
        complete: (r) => {
            //errMsg: "cloud.callFunction:ok"
            // requestID: "a8c535b2-6b46-11eb-8a7e-525400549ebe"
            // result:
            //  data: [{…}]
            //  errMsg: "collection.get:ok"
            try{
                wx.hideLoading()
                const code=r.errMsg.endsWith(":ok")&&r.result.errMsg.endsWith(":ok")
                if(!code)
                    err(r)

                if(typeof callback=="function")
                    callback(code,r.result.data)
                else info("run yun is end.")
            }catch (e){
                err(e)
            }
        }
    })
}

