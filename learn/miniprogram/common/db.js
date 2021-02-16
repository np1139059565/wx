module.exports.init=(log1,app1,callback)=>{
    log=log1
    app=app1
    info("init database...")
    checkSubjectSync((code)=>{
        if(code){
            info("subjectid is "+app1.subjectid)
            subjectid=app1.subjectid
            module.exports.querySync=querySync1
            info("database init is end.")
            if(typeof callback=="function"){
                callback()
            }
        }else err("database init is fail.")
    })
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


var dbName="longan",subjectid=null,app=null

/**
 *
 * @param switchCallback
 */
function checkSubjectSync(callback){
    if(app.subjectid==null){
        querySync1({field:{_id:true,subject:true}},(code,arr)=>{
            if(code){
                if(arr.length==0){
                    err("subject arr length is 0.")
                    callback(false)
                }else{
                    app.switchDB(arr.map(o=>o.subject),(sval,sindex)=>{
                        if(sval!=null){
                            app.subjectid=arr[sindex]._id
                            callback(true)
                        }else {
                            err("not select subject.")
                            callback(false)
                        }
                    })
                }

            }else {
                err("query subject is fail.")
                callback(false)
            }
        })
    }else callback(true)
}

/**
 *
 * @param geo {field:{settings:true,times:false},where:{_id:"xxxx"}}
 * @param callback (code,arr)
 * @param isnetwork
 */
function querySync1(geo, callback) {
    //init geo
    if (geo==null) {
        geo = {
            field: {}
        }
    }
    //init subjectid
    if(subjectid!=null){
        if(geo.where==null){
            geo.where={_id:subjectid}
        }else if(geo.where._id==null){
            geo.where._id=subjectid
        }
    }

    app.yun.yunSync("database",
        {queryType: "query", geo: geo, dbName: dbName},
        (code, arr) => {
            //res:[]
            if (typeof callback == "function") {
                callback(code, arr)
            }
        })
}


