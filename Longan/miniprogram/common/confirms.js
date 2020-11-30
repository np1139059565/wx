module.exports.init = (_app) => {
    app=_app
    module.exports.fcshow=cshow
    module.exports.fshowSelectList=showSelectList
}

var app
function cshow(title,okcallback,cancelcallback=null){
    //ok,cancel
    wx.showModal({
        title:title,
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
                app.units.logs.lerror(e)
            }
        }
    })
}
function showSelectList(strArr,okcallback){
    // select
    wx.showActionSheet({
        itemList: strArr,//['A', 'B', 'C'],
        success: (res)=> {
            try{
                if(typeof okcallback=="function"){
                    okcallback(strArr[res.tapIndex],res.tapIndex)
                }
            }catch (e) {
                app.units.logs.lerror(e,"confirms err!!")
            }
        }
    })
}
