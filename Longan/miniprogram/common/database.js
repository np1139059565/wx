module.exports.init = (_app, callback) => {
    app = _app
    app.utils.logs.linfo("init database...")
    Object.keys(DATA_CACHE).map(k=>delete DATA_CACHE[k])
    //init id
    getCache("_id",(fcode, str) => {
        //read subject id by file
        if (fcode && typeof str == "string" && str.trim() != "") {
            app.utils.logs.linfo("subject id is " + str)
            DATA_CACHE._id = str
            if (typeof callback == "function") {
                callback(fcode)
            }
        } else {
            // switch subject id by yun
            switchSubject(callback)
        }
    })
    module.exports.fquery = query1
    module.exports.fupdate = update1
    module.exports.fsaveToYun =saveToYun

}

var app
var DATA_CACHE = {}, dbName = "longan"

/**
 * 只是保存到本地,并且不能更新对象
 * @param upGeo {_id,setts}
 * @param callback
 */
function update1(upGeo, callback) {
    //update time
    upGeo.time = new Date().getTime()

    const fields = Object.keys(upGeo)

    function loop() {
        if (fields.length > 0) {
            const field = fields.splice(0, 1)[0]
            getCache(field, (gcode, obj) => {
                if (gcode) {
                    //refush cache
                    obj = refushObj(obj, upGeo[field])
                    // save to file
                    app.utils.fs.fwriteUTF8("db/" + field, JSON.stringify(obj), (wcode) => {
                        if (wcode) {
                            loop()
                        } else cb(wcode)
                    })
                } else cb(gcode)
            })
        } else cb(1)
    }

    function cb(code) {
        if (typeof callback == "function") {
            callback(code)
        }
    }

    loop()
}

function refushObj(oldObj, newObj) {
    const vtypes=["number", "string", "boolean"]
    if (vtypes.indexOf(typeof newObj) >= 0||vtypes.indexOf(typeof oldObj) >= 0) {
        return newObj
    } else if (typeof newObj == "object") {
        for (const k in newObj) {
            oldObj[k] = refushObj(oldObj[k], newObj[k])
        }
        return oldObj
    }
}

function saveToYun(callback) {
    const ug=JSON.parse(JSON.stringify(DATA_CACHE))
    delete ug._id
    app.utils.yun.fyun("database",
        {
            queryType: "update",
            geo: {where: {_id: DATA_CACHE._id}},
            updateGeo: ug,
            dbName: dbName
        },//old data:{a:1}=>updateGeo:{a:2}
        (code, res) => {
            if (typeof callback == "function") {
                callback(code && res.status.updated, res)
            }
        })
}

/**
 *
 * @param geo {field:{settings:true,times:false},where:{_id:"jsjjsjdjdjdjjdjd}}
 * @param callback
 * @param isnetwork
 */
function query1(geo, callback, byYun) {
    //init geo
    if (geo==null) {
        geo = {
            field: {}
        }
    }
    if (byYun) {
        if(DATA_CACHE._id==null&&Object.keys(geo.field).length>0){
            app.utils.logs.lerror(null,"query is fail.")
            if (typeof callback == "function") {
                callback(0)
            }
        }else{
            if(DATA_CACHE._id!=null){
                //id
                if(geo.where==null){
                    geo.where={_id:DATA_CACHE._id}
                }else {
                    geo._id = DATA_CACHE._id
                }
            }if(Object.keys(geo.field).length==0){
                //没有field代表查询所有数据
                delete geo.field
            }

            //query yun
            if(DATA_CACHE.settings==null||DATA_CACHE.settings.network){
                app.utils.yun.fyun("database",
                    {queryType: "query", geo: geo, dbName: dbName},
                    (code, res) => {
                        if (typeof callback == "function") {
                            callback(code&&res.length>0, res)
                        }
                    })
            }else   if (typeof callback == "function") {
                callback(0,{errMsg:"network is "+DATA_CACHE.settings.network})
            }
        }

    } else {
        const ret = {code: 1, res: [{}]}
        const fields = Object.keys(geo.field).filter(f => geo.field[f] == true)

        const loop=()=> {
            if (fields.length > 0) {
                const field = fields.splice(0, 1)[0]
                getCache(field, (code, fval) => {
                    if (!code) {
                        ret.code = 0
                    } else ret.res[0][field] = fval
                    loop()
                })
            } else if (typeof callback == "function") {
                callback(ret.code, ret.res)
            }
        }

        loop()
    }

}

function getCache(field, callback) {
    if (DATA_CACHE[field] == null) {
        //read file
        app.utils.fs.freadUTF8("db/" + field, (fcode, str) => {
            if (fcode && ["", null, undefined].indexOf(str) < 0) {
                DATA_CACHE[field] = JSON.parse(str)
                callback(fcode,JSON.parse(str))
            }else callback(1,"")
            // else {
            //     query1({field:{[field]:true}},(qcode,res)=>{
            //         if(qcode){
            //             DATA_CACHE[field] = res[0][field]//必须先缓存,否则下面的update1内部会调用getCache,造成死循环
            //             //write to file
            //             update1({[field]: DATA_CACHE[field]},(wcode)=>{
            //                 if(wcode){
            //                     getCache(field, callback)
            //                 }else callback(0, {errMsg:"write "+ field+" is fail."})
            //             })
            //         }else callback(qcode, {errMsg:"yun is not find "+ field+"."})
            //     },true)
            // }
        })
    } else {
        callback(1, DATA_CACHE[field])
    }
}

function switchSubject(callback) {
    query1(null,(code, res) => {
        if (code) {
            app.utils.cfirms.fshowSelectList(res.map(r => r.subject), (v, i) => {
                app.utils.logs.linfo("switch subject id is " + res[i]._id)
                DATA_CACHE._id=res[i]._id
                update1(res[i],callback)
            })
        }else if(typeof callback=="function"){
            callback(0)
        }
    },true)
}

