var head="---------------------------------------------------------------------------------\n[clog]"
var isShow=false
module.exports.lerror=(e, msg,isShow1)=>{
    if(msg==null){
        msg=""
    }
    msg=(head+" error "+msg)

    if(e){
        msg+=":"
        console.error(msg,e)
    }else console.error(msg)

    if((isShow1!=null?isShow1:isShow)){
        wx.showToast({
            title:msg,
            icon:"none",
            duration:3000,
        })
    }
}
module.exports.linfo=(msg,isShow1)=>{
    console.info(head,"info",msg)

    if((isShow1!=null?isShow1:isShow)){
        wx.showToast({
            title:msg,
            // icon:"success",
            // duration:3000,
        })
    }
}
module.exports.ref=(rIsShow=null,rHead=null)=>{
    console.info("refush...."+head+rIsShow)

    if(rHead!=null){
        head=rHead
    }
    if(rIsShow!=null){
        isShow=rIsShow
    }
}
