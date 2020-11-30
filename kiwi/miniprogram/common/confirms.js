const cclog=require('clog.js')
module.exports.cshow=(msg,okcallback,cancelcallback=null)=>{
    //ok,cancel
    wx.showModal({
        title:msg,
        showCancel:cancelcallback!=null,
        confirmText:"ok",
        cancelText:"cancel",
        success:(res)=>{
            try{
                if(res.confirm){
                    if(typeof okcallback=="function"){
                        okcallback()
                    }
                }else if(res.cancel){
                    if(typeof cancelcallback=="function"){
                        cancelcallback()
                    }
                }
            }catch (e) {
                cclog.lerror(e)
            }
        }
    })
}
module.exports.cshowList=(arr,okcallback)=>{
    // select
    wx.showActionSheet({
        itemList: arr,//['A', 'B', 'C'],
        success: (res)=> {
            try{
                if(typeof okcallback=="function"){
                    okcallback(arr[res.tapIndex])
                }
            }catch (e) {
                cclog.lerror(e)
            }
        }
    })
}