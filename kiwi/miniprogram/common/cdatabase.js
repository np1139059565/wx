var app
//init
module.exports.init = (_app) => {
    app = _app

    //不能更新对象
    module.exports.dupdate = (geo, updateGeo, callback) => {
        updateGeo.time = new Date().getTime()//update time
        app.ayun.yyun("database",
            {queryType: "update", geo: geo, updateGeo: updateGeo, dbName: "kiwi"},//old data:{a:1}=>updateGeo:{a:2}
            (code, res) => {
                dcallback(callback, code ? res.stats.updated : 0, code && res.stats.updated > 0, res)
            })
    }
    /**
     * my remove
     * @param geo
     * @param removeGeo {obj1:{key1:1...},arr1:[key1]}
     * @param callback
     */
    module.exports.dkiwiRemove = (subid, removeGeo, callback) => {
        app.ayun.yyun("database",
            {queryType: "kiwiRemove", id: subid, removeGeo: removeGeo, dbName: "kiwi"},
            (code, res) => {
                dcallback(callback, code && res.stats.updated ? 1 : 0, code, res)
            })
    }

    module.exports.dQuery = dQuery

}

function dQuery(geo, callback,isnetwork) {
    if (app.setts.network||isnetwork) {
        app.ayun.yyun("database",
            {queryType: "query", geo: geo, dbName: "kiwi"},//{queryType:"query",geo:{limit:3},dbName:"kiwi"}
            (code, res) => {
                dcallback(callback, res.data, code, res, false)
            })
    } else {
        // load local database
        const ares={code:1,res:[{}]}
        const filters=Object.keys(geo.field)
        const re=()=>{
            if(filters.length>0){
                const k=filters.splice(0,1)[0]
                const dpath=("databases/"+k)
                if(app.afile.fgetLocalPaths().indexOf(dpath)>=0){
                    app.afile.freadLocalFile(dpath,(code,str)=>{
                        ares.code=code
                        if(code){
                            ares.res[0][k]=JSON.parse(str)
                        }else{
                            //read is fail
                            filters.splice(0,9)
                        }
                        re()
                    })
                }else {
                    //is not find local.
                    app.alog.lerror(null,"is not find local."+dpath)
                    ares.code=0
                    re()
                }
            }else{
                //end callback
                dcallback(callback,ares.res,ares.code,ares,false)
            }
        }
        re()
    }
}

function dcallback(callback, rdata, code, yres, isUpLocalDatabase = true) {
    try {
        if (!code) {
            app.alog.lerror(yres, "cdatabase err.")
        } else if ([null, "", -1].indexOf(app.setts.subid) < 0 && isUpLocalDatabase&&app.setts.network) {
            //save new database to local
            upLocalDatabase(app.setts.subid)
        }
        if (typeof callback == "function") {
            callback(code, rdata)
        } else {
            app.alog.linfo("cdatabase default callback")
        }
    } catch (e) {
        app.alog.lerror(e)
    }
}

function upLocalDatabase(subid) {
    dQuery({
        where: {_id: subid},
        field: {time: true}
    }, (code, tres) => {
        if (code) {
            const localTime = "databases/time" + tres[0].time
            if (app.afile.fgetLocalPaths().indexOf(localTime) < 0) {
                dQuery({
                    where: {_id: subid},
                    field: {time:true,counts:true,heads:true,infos:true,keys:true,settings:true,subject:true}
                }, (code, qres) => {
                    if (code) {
                        //write time
                        app.afile.fwriteToLocal("true", localTime, null, null, "utf-8")
                        //write counts
                        app.afile.fwriteToLocal(JSON.stringify(qres[0].counts), "databases/counts", null, null, "utf-8")
                        //write heads
                        app.afile.fwriteToLocal(JSON.stringify(qres[0].heads), "databases/heads", null, null, "utf-8")
                        //write infos
                        app.afile.fwriteToLocal(JSON.stringify(qres[0].infos), "databases/infos", null, null, "utf-8")
                        //write keys
                        app.afile.fwriteToLocal(JSON.stringify(qres[0].keys), "databases/keys", null, null, "utf-8")
                        //write setts
                        app.afile.fwriteToLocal(JSON.stringify(qres[0].keys), "databases/settings", null, null, "utf-8")
                    } else app.alog.lerror(qres, "upLocalDatabase is fail.")
                },true)
            }
        } else app.alog.lerror(tres, "upLocalDatabase is fail.")
    })
}
