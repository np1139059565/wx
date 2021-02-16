module.exports.init=(log1,app1)=>{
    log=log1
    info("init fzk...")
    app=app1
    tday=getTday()
    tweek=getTweek()
    tmonth=getTmonth()
    info("tday:"+tday)
    info("tweek:"+tweek)
    info("tmonth:"+tmonth)
    LASTS.map(l=>kiByLasts["L"+l]=[])
    cache[app.DB_K.KEYS]=JSON.parse(app.file.readfile(app.dbpath+app.DB_K.KEYS))
    cache[app.DB_K.INFOS]=JSON.parse(app.file.readfile(app.dbpath+app.DB_K.INFOS))
    cache[app.DB_K.COUNTS]=JSON.parse(app.file.readfile(app.dbpath+app.DB_K.COUNTS))
    LASTS=app.setts.lasts
    info("lasts:"+LASTS)
    lastLength=app.setts.lastLength
    info("lastLength:"+lastLength)
    refushAll()
    module.exports.nextInfo=nextInfo
    module.exports.cache=cache
    info("init fzk is end.")
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

//progress:[{isCorr,ki}]
var app=null,tday,tweek,tmonth,cache={},kiByLasts={},minkiarr=[],maxkiarr=[],errkiarr=[],progress=[],LASTS,lastLength

/**
 *
 * @param to ms
 * @returns {string}
 */
function getTday(to = 0) {
    const tday = new Date()
    tday.setHours(12, 0, 0, 0)
    return new Date(tday.getTime() - (to * 24 * 60 * 60 * 1000)).toJSON().split("T")[0]
}

/**
 *
 * @param to week
 * @returns {string} :2020-w-36
 */
function getTweek(to = 0) {
    const tdInfo = getTday(0).split("-")
    const tday = new Date(tdInfo[0], parseInt(tdInfo[1]) - 1, tdInfo[2]),//this day
        yfday = new Date(tdInfo[0], 0, 1),//year first day
        dcount = Math.round((tday.valueOf() - yfday.valueOf()) / 86400000);
    const tweek = Math.ceil((dcount + ((yfday.getDay() + 1) - 1)) / 7) - to
    return tdInfo[0] + "-w-" + tweek
}

/**
 *
 * @param to month
 * @returns {string} 2020-m-12
 */
function getTmonth(to = 0) {
    const tdInfo = getTday(0).split("-")
    return tdInfo[0] + "-m-" + (parseInt(tdInfo[1]) - to)
}

function refushAll(){
    // clear
    for(const lk in kiByLasts){
        kiByLasts[lk].splice(0,9999)
    }
    minkiarr.splice(0,9999)
    maxkiarr.splice(0,9999)
    errkiarr.splice(0,9999)
    progress.splice(0,9999)
    // cache to lasts
    for(const kcode in cache[app.DB_K.INFOS]){
        const inf=cache[app.DB_K.INFOS][kcode]
        //min,max
        if(inf[app.DB_K.COUNT]==0){
            minkiarr.push(cache[app.DB_K.KEYS].indexOf(inf[app.DB_K.SKEY]))
        }else if(inf[app.DB_K.COUNT]>=LASTS[LASTS.length-1]){
            maxkiarr.push(cache[app.DB_K.KEYS].indexOf(inf[app.DB_K.SKEY]))
        }else{
            //last
            for(const i in LASTS){
                if(inf[app.DB_K.COUNT]<LASTS[i]){
                    kiByLasts["L"+LASTS[i]].push(cache[app.DB_K.KEYS].indexOf(inf[app.DB_K.SKEY]))
                    break;
                }
            }
        }
    }
    //get min to lasts
    if(kiByLasts["L"+LASTS[0]].length==0){
        for(var i=0;i<lastLength;i++){
            if(minkiarr.length>0){
                kiByLasts["L"+LASTS[0]].push(minkiarr.splice(0,1)[0])
            }else break;
        }
    }
    //sort max by asc
    maxkiarr.sort((i1,i2)=>{
        const kcode1=cache[app.DB_K.KEYS][i1].split("").map(_ => _.charCodeAt()).join("")
        const kcode2=cache[app.DB_K.KEYS][i2].split("").map(_ => _.charCodeAt()).join("")
        return cache[app.DB_K.INFOS][kcode1][app.DB_K.COUNT] - cache[app.DB_K.INFOS][kcode2][app.DB_K.COUNT]
    })
    info("kiByLasts:",kiByLasts)
    info("minKis:",minkiarr)
    info("maxKis:",maxkiarr)
    info("errKis:",errkiarr)
}

function nextInfo(){
    var selectKi=-1
    if(errkiarr.length>0&&Math.random()>=app.setts.errRadio&&(progress.length==0||errkiarr[errkiarr.length-1]!=progress[progress.length-1].ki)){
        //get err
        selectKi= errkiarr.splice(0,1)
    }else{
        selectKi=getKi(errkiarr)
    }
    //ki to info
    if(selectKi>=0){
        progress.push({isCorr:null,ki:selectKi})
        const kcode=cache[app.DB_K.KEYS][selectKi].split("").map(_ => _.charCodeAt()).join("")
        return cache[app.DB_K.INFOS][kcode]
    }else return null
}
function getKi(filterKis){
    //filter kis
    if(filterKis==null){
        filterKis=[]
    }
    //filter progress
    const progresski=progress.length>0?progress[progress.length-1].ki:-1
    //wait kis
    const waitnextkiarr=[]
    // get fzk to wait
    for(const lk in kiByLasts){
        const kiarr=kiByLasts[lk]
        for(const ki in kiarr){
            const key=cache[app.DB_K.KEYS][kiarr[ki]]
            const kcode=key.split("").map(_ => _.charCodeAt()).join("")
            const inf=cache[app.DB_K.INFOS][kcode]
            const count=cache[app.DB_K.COUNTS][kcode]
            if(filterKis.indexOf(ki)<0&&progresski!=ki
                &&!(LASTS.indexOf(inf[app.DB_K.COUNT])>=0&&count[app.DB_K.DAY]!=null&&count[app.DB_K.DAY][tday]!=null)){
                waitnextkiarr.push(ki)
            }
        }
    }
    //get max to wait
    for(var i=0;i<lastLength;i++){
        if(filterKis.indexOf(maxkiarr[i])<0&&progresski!=maxkiarr[i]&&maxkiarr.length>i){
            waitnextkiarr.push(maxkiarr[i])
        }else break;
    }
    //get ki by wait random
    if(waitnextkiarr.length>0){
        return waitnextkiarr[parseInt(Math.random()*waitnextkiarr.length)]
    }else return -1
}