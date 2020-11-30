// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV//yfwq1-4nvjm
})

// 云函数入口函数
exports.main = async (event, context) => {
    try {
        const https = require("https")
        /**
         * await,Promise组合使用可以将异步变成同步,resolve是成功后的返回值,reject是失败的
         */
        return await new Promise((resolve, reject) => {
            https.get(event.url, response => {
                var fdata=null
                // response.setEncoding("binary");  //二进制binary (注意这里不要修改成二进制数据,使用默认buffer即可,界面的FileSystemManager.writeFile写出的文件有问题)
                response.on("data", function (data) {    //加载到内存
                    if(fdata==null){
                        fdata = data
                    }else {
                        fdata += data
                    }
                }).on("end", function () {          //加载完
                    resolve(fdata)
                }).on("error",e=>{
                    reject(e)
                })
            })
        })
    } catch (e1) {
        return e1
    }
}