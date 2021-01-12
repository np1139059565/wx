
module.exports.init = (_app,callback) => {
    app=_app
    tday=app.utils.date.fgetToDay()
    tweek=app.utils.date.fgetToWeek()
    tmonth=app.utils.date.fgetToMonth()
    app.utils.logs.linfo("init fzk...")

    lastLength=app.utils.setts.fcache().lastLength
    app.utils.db.fquery({field:{keys:true,infos:true,counts:true}},(code,res)=>{
        if(code){
            FZK_CACHE=res[0]
            //parse by c
            refushAll()
        }else app.utils.logs.lerror(null,"query keys is fail.")

        if(typeof callback=="function"){
            callback(code)
        }
    })
}

var app
var FZK_CACHE={
    keys:[],
    infos:{},
    counts:{}
},
    lastLength=5,
    tday,tweek,tmonth
const lasts=[7,12,17,20,22],
    kiByLasts={L7:[],L12:[],L17:[],L20:[],L22:[]},
    minKis=[] ,//
    maxKis=[],
    errKis=[],
    progress=[]//[{isCorr,ki}]

function refushAll(){
    // clear
    for(const lk in kiByLasts){
        kiByLasts[lk].splice(0,9999)
    }
    minKis.splice(0,9999)
    maxKis.splice(0,9999)
    errKis.splice(0,9999)
    progress.splice(0,9999)
    // cache to lasts
    for(const kcode in FZK_CACHE.infos){
        const info=FZK_CACHE.infos[kcode]
        //min,max
        if(!info.c>0){
            minKis.push(FZK_CACHE.keys.indexOf(info[app.utils.setts.fcache().skey]))
        }else if(info.c>=lasts[lasts.length-1]){
            maxKis.push(FZK_CACHE.keys.indexOf(info[app.utils.setts.fcache().skey]))
        }else{
            //last
            for(const i in lasts){
                if(info.c<lasts[i]){
                    kiByLasts["L"+lasts[i]].push(FZK_CACHE.keys.indexOf(info[app.utils.setts.fcache().skey]))
                    break;
                }
            }
        }
    }
    //get min to lasts
    if(kiByLasts["L"+lasts[0]].length==0){
        for(var i=0;i<lastLength;i++){
            if(minKis.length>0){
                kiByLasts["L"+lasts[0]].push(minKis.splice(0,1)[0])
            }else break;
        }
    }
    //sort max by asc
    maxKis.sort((i1,i2)=>{
        const kcode1=FZK_CACHE.keys[i1].split("").map(_ => _.charCodeAt()).join("")
        const kcode2=FZK_CACHE.keys[i2].split("").map(_ => _.charCodeAt()).join("")
        return FZK_CACHE.infos[kcode1].c - FZK_CACHE.infos[kcode2].c
    })
}
function nextInfo(){
    var selectKi=-1
    if(errKis.length>0&&Math.random()>=0.5555&&(progress.length==0||errKis[errKis.length-1]!=progress[progress.length-1].ki)){
        //get err
        selectKi= errKis.splice(0,1)
    }else{
        selectKi=getKi(errKis)
    }
    //ki to info
    if(selectKi>=0){
        progress.push({isCorr:null,ki:selectKi})
        const kcode=FZK_CACHE.keys[selectKi].split("").map(_ => _.charCodeAt()).join("")
        return FZK_CACHE.infos[kcode]
    }else return null
}
function getKi(filterKis){
    //filter kis
    if(filterKis==null){
        filterKis=[]
    }
    //filter progress
    if(progress.length>0){
        filterKis.push(progress[progress.length-1].ki)
    }
    //wait kis
    const waitNextKis=[]
    // get fzk to wait
    for(const lk in kiByLasts){
        const kiarr=kiByLasts[lk]
        for(const ki in kiarr){
            const key=FZK_CACHE.keys[kiarr[ki]]
            const kcode=key.split("").map(_ => _.charCodeAt()).join("")
            const info=FZK_CACHE.infos[kcode]
            const count=FZK_CACHE.counts[kcode]
            if(filterKis.indexOf(ki)<0&&!(lasts.indexOf(info.c)>=0&&count.d!=null&&count.d[tday]!=null)){
                waitNextKis.push(ki)
            }
        }
    }
    //get max to wait
    for(var i=0;i<lastLength;i++){
        if(filterKis.indexOf(maxKis[i])<0&&maxKis.length>i){
            waitNextKis.push(maxKis[i])
        }else break;
    }
    //get ki by wait random
    if(waitNextKis.length>0){
        return waitNextKis[parseInt(Math.random()*waitNextKis.length)]
    }else return -1
}
function isErr(key){
    return errKis.indexOf(FZK_CACHE.keys.indexOf(key))>=0
}
function saveCorr(info,isCorr){
    const skey=info[app.utils.setts.fcache().skey]
    const kcode=skey.split("").map(_ => _.charCodeAt()).join("")
    var count=FZK_CACHE.counts[kcode]
    if(count==null){
        count={
            d:{[tday]:{c:1,e:0}},
            w:{[tweek]:{c:1,e:0}},
            m:{[tmonth]:{c:1,e:0}}
        }
    }else if(count.d[tday]==null){
        count.d[tday]={c:1,e:0}
        if(count.w[tweek]==null){
            count.w[tweek]={c:1,e:0}
        }
        if(count.m[tmonth]==null){
            count.m[tmonth]={c:1,e:0}
        }
    }else{
        count.d[tday].c+=1
        count.w[tweek].c+=1
        count.m[tmonth].c+=1
    }
    info.c+=1
    if(isCorr==false){
        info.e+=1
        count.d[tday].e+=1
        count.w[tweek].e+=1
        count.m[tmonth].e+=1
        errKis.push(FZK_CACHE.keys.indexOf(skey))
    }
    app.utils.db.fupdate({
        infos:{[kcode]:info},
        counts:{[kcode]:count}
    },(ucode)=>{
        if(ucode){
            //re cache
            FZK_CACHE.infos[kcode]=info
            FZK_CACHE.counts[kcode]=count
        }
    })
}
function getO4(ainfo){
    const aki=FZK_CACHE.keys.indexOf(ainfo[app.utils.setts.fcache().skey])
    const filterKis=[aki]
    for(var i =0;i<4;i++){
        const oki=getKi(filterKis)
        if(oki>=0){
            filterKis.push(oki)
        }else filterKis.push(aki)
    }
    return filterKis.splice(1,4).map(ki=>FZK_CACHE.infos[FZK_CACHE.keys[ki].split("").map(_ => _.charCodeAt()).join("")])
}

module.exports.frefushAll=refushAll
module.exports.fnextInfo=nextInfo
module.exports.fisErr=isErr
module.exports.fsaveCorr=saveCorr
module.exports.fgetO4=getO4
