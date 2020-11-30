module.exports.init = (_app) => {
    app=_app
    app.units.logs.linfo("init setts...")
    module.exports.fcache=()=>{
        return SETTS_CACHE
    }
    module.exports.frefushSetts=refushSetts
}

var app
var SETTS_CACHE={
    network:true
}
function refushSetts(){
    app.units.db.fquery({field:{settings:true}},(code,res)=>{
        if(code){
            SETTS_CACHE=res[0].settings
        }
    })
}