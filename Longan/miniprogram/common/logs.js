const head="----------------------------------------\n[logs]"
module.exports.lerror=(e,msg1,msg2,msg3)=>{
    // wx.showToast({
    //     title:msg,
    //     icon:"none",
    //     duration:3000,
    // })
    console.error(head,msg1?msg1:"",msg2?msg2:"",msg3?msg3:"",e?e:"")
}
module.exports.linfo=(msg1,msg2,msg3)=>{
    console.info(head,msg1?msg1:"",msg2?msg2:"",msg3?msg3:"")

    // wx.showToast({
    //     title:msg,
    //     icon:"success",
    //     duration:3000,
    // })
}
