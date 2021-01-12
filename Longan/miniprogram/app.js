//app.js
App({
    onLaunch: function () {
        // init utils
        this.initAll(Object.values(this.utils),true)
    },
    utils:{
        //log
        logs: require("common/logs.js"),
        cfirms: require("common/confirms.js"),
        // fs by log
        fs: require("common/fs1.js"),
        //yun by log,setts
        yun: require("common/cyun.js"),
        // database by log,yun
        db: require("common/database.js"),
        // setts by log,database
        setts: require("common/setting.js"),
        //date
        date: require("common/date.js"),
        // fzk by log,database,date
        tts: require("common/tts.js"),
        // fzk by log,database,date
        fzk: require("common/fzk.js"),
    },
    callbacks:[],
    initAll: function (uarr, code) {
        if (uarr.length > 0) {
            const util = uarr.splice(0, 1)[0]
            if (typeof util.init == "function") {
                util.init(this, (icode)=>{
                    this.initAll(uarr,icode)
                })
            }else this.initAll(uarr,code)
        } else {
            setTimeout(()=>{
                this.callbacks=this.callbacks.filter(ev=>{
                    this.utils.logs.linfo("run app callback:"+ev.toString())
                    ev(code)=="unit"
                })
            },500)
        }
    }
})