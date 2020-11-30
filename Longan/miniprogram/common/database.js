module.exports.init = (_app) => {
    app = _app
    app.units.logs.linfo("init database...")
    module.exports.fquery = query1
}

var app
const DATA_CACHE = {}, dbName = "longan"

/**
 *
 * @param geo {field:{settings:true,times:false}}
 * @param callback
 * @param isnetwork
 */
function query1(geo, callback) {
    if (typeof geo != "object") {
        geo = {
            field: {}
        }
    }

    //hand data
    function loop1(fields, cb, ret) {
        if (fields.length > 0) {
            if (ret == null) {
                ret = {code: 1, res: [{}]}
            }
            const field = fields[0]
            if (geo.field[field] && DATA_CACHE[field] == null) {
                //read field to data cache
                queryField(field, geo, (code, res) => {
                    if (code) {
                        DATA_CACHE[field] = res
                    } else {
                        ret.code = 0
                        fields.splice(0, 9)
                        app.units.logs.lerror(null, "query " + field + " is fail")
                    }
                    loop1(fields, cb, ret)
                })
            } else {
                //next
                if (geo.field[field]) {
                    //get data cache
                    ret.res[0][field] = DATA_CACHE[field]
                }
                fields.splice(0, 1)
                loop1(fields, cb, ret)
            }
        } else if (typeof cb == "function") {
            cb(ret.code, ret.res)
        }
    }

    if (DATA_CACHE.subjectId == null) {
        app.units.logs.linfo("read subject id...")
        app.units.fs.freadUTF8("subjectId", (fcode, str) => {
            //read subject id by file
            if (fcode && typeof str == "string" && str.trim() != "") {
                app.units.logs.linfo("subject id is " + str)
                DATA_CACHE.subjectId = str
                loop1(Object.keys(geo.field))
            } else {
                // switch subject id by yun
                app.units.logs.linfo("switch subject id...")
                switchSubject((code) => {
                    loop1(Object.keys(geo.field))
                })
            }
        })

    } else loop1(Object.keys(geo.field))

}

function queryField(field, geo, callback) {
    //read file
    app.units.fs.freadUTF8(field, (fcode, str) => {
        if (fcode && typeof str == "string" && str.trim() != "") {
            callback(fcode, JSON.parse(str))
        } else {
            //def subject id
            if (geo.where == null) {
                geo.where = {_id: DATA_CACHE.subjectId}
            } else if (geo.where._id == null) {
                geo.where._id = DATA_CACHE.subjectId
            }
            //read yun
            app.units.yun.fyun("database",
                {queryType: "query", geo: geo, dbName: dbName},
                (ycode, res) => {
                    if (ycode) {
                        //save to file
                        for (var f in res[0]) {
                            if (["_id", "subject"].indexOf(f) < 0) {
                                app.units.fs.fwriteUTF8(f, JSON.stringify(res[0][f]))
                            }
                        }
                    }
                    callback(ycode, ycode ? res[0][field] : null)
                })
        }
    })
}

function switchSubject(callback) {
    app.units.yun.fyun("database",
        {queryType: "query", geo: {field: {subject: true}}, dbName: dbName},
        (code, res) => {
            if (code) {
                app.units.cfirms.fshowSelectList(res.map(r => r.subject), (v, i) => {
                    app.units.fs.fwriteUTF8("subjectId", res[i]._id)
                    DATA_CACHE.subjectId = res[i]._id
                    if (typeof callback == "function") {
                        callback(code, res[i]._id)
                    }
                })
            }
        })
}

