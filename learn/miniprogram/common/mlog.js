
module.exports.init=(info1,err1)=>{
    if(info1!=null)
        info=info1
    if(err1!=null)
        err=err1
    info("init mlog...")
    module.exports.info=info
    module.exports.err=err
    info("mlog init is end.")
}
function err(e1,e2,e3,e4){
    console.error("mlog:",valType(e1),valType(e2),valType(e3),valType(e4))
}
function info(inf1,inf2,inf3,inf4){
    console.info("mlog:",valType(inf1),valType(inf2),valType(inf3),valType(inf4))
}
function valType(e){
    if(e instanceof TypeError)
        return e.stack
    else if(e!=null)
        return e
    else return ""
}