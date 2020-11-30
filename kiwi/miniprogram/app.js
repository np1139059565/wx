//app.js
App({
    onLaunch: function () {
        // settings by adatabase
        this.setts = {
            defSub:"english",
            subid:-1,
            network:true,//default true
            key:"en",
            looplay:{},
            filLetteRadio:0.33,
            file:{
                space:{
                    sval:0,
                    color:"green",
                    itype:"progress"
                },
                options:{
                    itype:"buttons",
                    buttons:[
                        {
                            btype:"image",
                            sval:"/images/refush.jpg",
                            eLink:"afile.floopReLocalSpace",
                        },
                        {
                            btype:"",
                            sval:"↓",
                            eLink:"afile.fdownAllYunToLocal"
                        },
                        {
                            btype:"image",
                            sval:"/images/del.jpg",
                            eLink:"afile.fcleanLocalFile"
                        }
                    ]
                },
            },
            fzk:{}
        }
        this.reAppSett=(appSett, newSett)=>{
            for(var k in newSett){
                if(["number","string","boolean","undefined"].indexOf(typeof appSett[k])>=0){
                    appSett[k]=newSett[k]
                }else this.reAppSett(appSett[k],newSett[k])
            }
        },
        this.initSetts=(callback)=>{
            this.adatabase.dQuery({
                where:{_id:this.setts.subid},
                field: {settings:true}
            }, (code,res) => {
                if(code){
                    this.reAppSett(this.setts,res[0].settings)
                }
                if(typeof callback=="function"){
                    callback(code)
                }
            },true)
        }
        //log
        this.aconfirms = require("common/confirms.js")
        this.alog = require("common/clog.js")
        // yun by log
        this.ayun = require("common/cyun.js")
        this.ayun.init(this)
        //adatabase by log,yun
        this.adatabase = require("common/cdatabase.js")
        this.adatabase.init(this)
        // file by setts
        this.afile = require("common/cfile.js")
        this.afile.init(this)
        // md5
        this.md5=require("common/md5.js")
        //voice by log,md5,file
        this.avoice=require("common/cvoice.js")
        this.avoice.init(this)
        //fzk by log
        this.afzk = require("pages/fzk/fzk.js")
        this.afzk.init(this)
    },
})
