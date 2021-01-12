module.exports.init = (_app,callback) => {
    app=_app
    app.utils.logs.linfo("init setts...")

    app.utils.db.fquery({field:{settings:true}},(code,res)=>{
        if(code){
            SETTS_CACHE=res[0].settings
        }else app.utils.logs.lerror(null,"query setts is fail.")
        if(typeof callback=="function"){
            callback(code)
        }
    })
}
module.exports.fcache=()=>{
    return SETTS_CACHE
}

var app
var SETTS_CACHE={
    network:true
}