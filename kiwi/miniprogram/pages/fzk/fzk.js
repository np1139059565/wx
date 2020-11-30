var app = null
var subid, day, yweek, month

const fzknArr = [7, 12, 17, 20, 22]
const dtCacByFZK = {}//{fzkn7:[{o4Infos:[],info,count},dt...],}
const dtCac0 = []//[{o4Infos:[],info,count},dt...]
const dtCac99 = []

const progressArr = []
const progrErrs = []//[{panswer:true,dt}]
var proThi = -1

module.exports.init = (_app) => {
    app = _app
    module.exports.fRefushFZK = refushFZK
    module.exports.fToPage = toPage
    module.exports.fopenEdit = openEdit
    module.exports.fGetFZKThi = () => {
        return proThi
    }
    module.exports.fSaveCorr = saveAnswer
}

function refushFZK(_subid, _day, _yweek, _month, isCleanProgress) {
    //init by network
    if (subid != _subid || day != _day || yweek != _yweek || month != _month || progressArr.length == 0 || isCleanProgress) {
        subid = _subid
        day = _day
        yweek = _yweek
        month = _month
        refushDtCache(isCleanProgress, (code)=>{
            if(code){
                toPage(false)
            }
        })//callback to first page
    } else toPage(false, 0)//to this page
}

function toPage(isNext, toLen) {
    var isRefushPage = true
    if (proThi < 0) {
        //init progressData
        proThi = 0
        isRefushPage = refushPro()
    } else if (isNext) {
        //fraction
        if (proThi + 1 >= app.setts.fzk.maxProgress) {
            isRefushPage = false
            app.aconfirms.cshow("end!")
        } else {
            // next
            proThi += 1
            if (progressArr[proThi] == null) {
                isRefushPage = refushPro()
            }
        }
    } else if (toLen >= 0 || toLen < 0) {
        if ((proThi + toLen) < 0) {
            //first
            if (proThi == 0) {
                isRefushPage = false
            } else {
                proThi = 0
            }
        } else if ((proThi + toLen) > (progressArr.length - 1)) {
            //last
            if (proThi == progressArr.length - 1) {
                isRefushPage = false
            } else {
                proThi = progressArr.length - 1
            }
        } else {
            //pri,next
            proThi += toLen
        }
    } else isRefushPage = false
    //open page
    if (isRefushPage) {
        openPage()
    }
}

function openPage() {
    const dt = progressArr[proThi].dt
    var c = dt.info.c
    if (c > app.setts.fzk.length[fzknArr.length - 1]) {
        c = 99
    }
    const ptype2 = app.setts.fzkts["t" + c]
    const params = {
        progress: ((proThi + 1) + "/" + app.setts.fzk.maxProgress + " e:" + dt.info.e + " c:" + dt.info.c),
        isErr: progressArr[proThi].panswer == false,
        ptype2: ptype2,
        answerInfo: dt.info,
        o4Infos: dt.o4Infos
    }

    //url by ptype
    var url = "/pages/fzk/fill/fill"
    if (ptype2[1].indexOf("edi") < 0) {
        url = "/pages/fzk/choice/choice"
    }

    // if (isSaveOldPage) {
    //     wx.navigateTo({
    //         url: url + "?params=" + JSON.stringify(params),
    //     })
    // } else {
    wx.redirectTo({
        url: url + "?params=" + JSON.stringify(params),
    })
    // }
}

function openEdit(skey) {
    wx.navigateTo({
        url: "/pages/edit/edit?&skey=" + skey,
    })
}

function saveAnswer(isCorr) {
    //只能保存最新的进度
    if (proThi == progressArr.length - 1 && progressArr[proThi].panswer == null) {
        //local
        progressArr[proThi].panswer = isCorr
        const dt = progressArr[proThi].dt
        dt.info.c += 1
        dt.count.d[day].c += 1
        dt.count.w[yweek].c += 1
        dt.count.m[month].c += 1
        if (isCorr == false) {
            progrErrs.push(progressArr[proThi])
            dt.info.e += 1
            dt.count.d[day].e += 1
            dt.count.w[yweek].e += 1
            dt.count.m[month].e += 1
        }
        const skcode = dt.info[app.setts.key].split("").map(_ => _.charCodeAt()).join("")
        app.adatabase.dupdate(
            {where: {_id: subid}},
            {
                counts: {[skcode]: dt.count},
                infos: {[skcode]: dt.info},
            },
            (code,res) => {
                if (!code) {
                    app.aconfirms.cshow("save is fail:" + res)
                }
            }
        )
    }
}

function refushDtCache(isCleanProgress, callback) {
    //clean
    dtCac0.splice(0, app.setts.fzk.length)
    dtCac99.splice(0, app.setts.fzk.length)
    for (var i in fzknArr) {
        dtCacByFZK["fzkn" + fzknArr[i]] = []
    }
    if (isCleanProgress) {
        proThi = -1
        progressArr.splice(0, app.setts.fzk.maxProgress)
    }
    //query
    app.adatabase.dQuery({
        where: {_id: subid},
        field: {counts: true, keys: true, infos: true}
    }, (code,res) => {
        if(code){
            const skeys = res[0].keys
            const infos = res[0].infos
            const counts = res[0].counts
            const adts = []
            const dtsByF = {}
            //keys,counts to fzk
            for (var i in skeys) {
                const skey = skeys[i]
                const skcode = skey.split("").map(_ => _.charCodeAt()).join("")
                const info = Object.assign({[app.setts.key]: skey}, infos[skcode])
                const count = {
                    d: {[day]: {c: 0, e: 0}},
                    w: {[yweek]: {c: 0, e: 0}},
                    m: {[month]: {c: 0, e: 0}}
                }
                if (counts[skcode] != null) {
                    Object.assign(count.d[day], counts[skcode].d[day])
                    Object.assign(count.w[yweek], counts[skcode].w[yweek])
                    Object.assign(count.m[month], counts[skcode].m[month])
                }

                const dt = {o4Infos: [], info: info, count: count}
                if (info.c == 0) {
                    //add cache min data by app.setts.fzk.length
                    if (dtCac0.length < app.setts.fzk.length) {
                        dtCac0.push(dt)
                    }
                } else if (info.c >= fzknArr[fzknArr.length - 1]) {
                    //add cache max data by app.setts.fzk.length
                    if (dtCac99.length < app.setts.fzk.length) {
                        dtCac99.push(dt)
                    }
                } else {
                    //add cache data by fzk
                    var ispush = true
                    for (var ni in fzknArr) {
                        if (ispush && info.c <= fzknArr[ni]) {
                            ispush = false
                            dtCacByFZK["fzkn" + fzknArr[ni]].push(dt)
                        }
                    }
                }
                //根据首字母分类
                adts.push(dt)
                const fir = skey.substr(0, 1)
                if (dtsByF[fir] == null) {
                    dtsByF[fir] = [dt]
                } else dtsByF[fir].push(dt)
            }
            //refush other 4 by first cache
            refushO4Infos(dtsByF, adts)
        }
        if(typeof callback=="function"){
            callback(code)
        }
    })
}

function refushO4Infos(dtsByFir, adts, wrdts) {
    //逐个更新
    if (wrdts == null) {
        refushO4Infos(dtsByFir, adts, dtCac0)
        refushO4Infos(dtsByFir, adts, dtCac99)
        for (var i in fzknArr) {
            refushO4Infos(dtsByFir, adts, dtCacByFZK["fzkn" + fzknArr[i]])
        }
    } else {
        for (var i in wrdts) {
            const wrdt = wrdts[i]
            //find other 4 by first
            if (wrdt.o4Infos.length == 0) {
                //find dt arr by first or other
                const skey = wrdt.info[app.setts.key]
                const fir = skey.substr(0, 1)
                var firdts = dtsByFir[fir]
                if (firdts == null || firdts.length == 0) {
                    //找不到首字母相同的dt列表,则找某个字母相同的也行
                    const skeys = skey.split("")
                    for (var oi in skeys) {
                        const farr = dtsByFir[skeys[oi]]
                        if (farr != null && farr.length > 0) {
                            firdts = farr
                            break;
                        }
                    }
                    //还是找不到就为空
                    if (firdts == null) {
                        firdts = []
                    }
                }
                //get o4Infos by first dts random
                var wi = firdts.length
                while (wrdt.o4Infos.length < 3 && wi > 0) {
                    const odt = firdts[wi -= 1]
                    if (odt != null && odt.info[app.setts.key] != wrdt.info[app.setts.key]) {
                        wrdt.o4Infos.push(odt.info)
                    }
                }
                //get o4Infos by all dts random
                wi = adts.length
                while (wrdt.o4Infos.length < 3 && wi > 0) {
                    const odt = adts[wi -= 1]
                    if (odt != null && odt.info[app.setts.key] != wrdt.info[app.setts.key]) {
                        wrdt.o4Infos.push(odt.info)
                    }
                }
                //add this
                if (wrdt.o4Infos.length < 3) {
                    wrdt.o4Infos.push(wrdt.info)
                }
                if (wrdt.o4Infos.length < 3) {
                    wrdt.o4Infos.push(wrdt.info)
                }
                if (wrdt.o4Infos.length < 3) {
                    wrdt.o4Infos.push(wrdt.info)
                }
                // answer
                const random=parseInt(Math.random() * 4)
                wrdt.o4Infos.splice(random, 0, wrdt.info)
            }
        }
    }
}

function refushPro() {
    const oldt = (proThi > 0 && progressArr.length > proThi ? progressArr[proThi - 1].dt : null)

    const waitdts = []
    //parse fzks by fzkn
    for (var i = fzknArr.length - 1; i >= 0; i--) {
        const fzkn = fzknArr[i]
        const fdts = dtCacByFZK["fzkn" + fzkn]
        //parse fdts
        for (var j in fdts) {
            const dt = fdts[j]
            //refush cache
            if (dt.info.c > fzkn) {
                if (i == (fzknArr.length - 1)) {
                    //end fzk dt to max cache
                    dtCac99.push(fdts.splice(j, 1)[0])
                } else {
                    //fzk dt to i+1 cache
                    dtCacByFZK["fzkn" + fzknArr[i + 1]].push(fdts.splice(j)[0])
                }
            } else if ((oldt != null && oldt.info[app.setts.key] == dt.info[app.setts.key]) == false) {
                //add dt to wait dts by 不能与上个单词相同
                if (dt.info.c == fzkn) {
                    //add dt by this day is not null
                    if (dt.count.d[day].c == 0) {
                        waitdts.push(dt)
                    }
                } else waitdts.push(dt)
            }
        }
    }
    //cache min to fzk min
    if (waitdts.length == 0&&dtCacByFZK["fzkn" + fzknArr[0]].length<app.setts.fzk.length) {
        const dtCacByFZK0 = dtCacByFZK["fzkn" + fzknArr[0]]
        const fzk0s = dtCacByFZK0.length
        for (var ki = dtCac0.length - 1; ki >= 0; ki--) {
            dtCacByFZK0.push(dtCac0.splice(ki, 1)[0])
        }
        if (dtCacByFZK0.length > fzk0s) {
            return refushPro()
        }
    }
    //sort by c
    dtCac99.sort((adt, bdt) => {
        return adt.info.c - bdt.info.c
    })
    // add fzk99 max
    for (var i = 0; i < app.setts.fzk.length; i++) {
        if (dtCac99.length > i) {
            waitdts.push(dtCac99[i])
        }
    }
    //错误列表不为空,并且待选列表为空(或者随机允许&&错误单词与上个单词不一样)
    if (progrErrs.length > 0 &&(waitdts.length==0||oldt &&  progrErrs[0].dt.info[app.setts.key] != oldt.info[app.setts.key] && Math.random() >= 0.333)) {
        progressArr.push({panswer: false, dt: progrErrs.splice(0, 1)[0].dt})
        return true
    } else {
        const sdt = waitdts[parseInt(Math.random() * waitdts.length)]
        if (sdt != null) {
            progressArr.push({panswer: null, dt: sdt})
        } else {
            app.aconfirms.cshow("fzk get is null.")
        }
        return sdt != null
    }
}
