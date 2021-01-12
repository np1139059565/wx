// miniprogram/pages/setting.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        setts: {
            db: {
                butts: {
                    down: {
                        text: "↓",
                        tapEvent: "fdownDBToLocal",
                    },
                    upload: {
                        text: "↑",
                        tapEvent: "fupDBToYun",
                    },
                    refush: {
                        itype: "icon",
                        src: "/images/loop.jpg",
                        tapEvent: "fcleanDBCache",
                    }
                }
            },
            images: {
                butts: {
                    progress: {
                        itype: "progress",
                        color: "green",
                        pro: 0,
                    },
                    down: {
                        text: "↓",
                        tapEvent: "fdownImageToLocal",
                    },
                    refush: {
                        itype: "icon",
                        src: "/images/loop.jpg",
                        tapEvent: "frefushImages",
                    },
                    del: {
                        itype: "icon",
                        src: "/images/del.jpg",
                        tapEvent: "fdelImages",
                    }
                }
            },
            voices: {
                butts: {
                    progress: {
                        itype: "progress",
                        color: "green",
                        pro: 0,
                    },
                    down: {
                        text: "↓",
                        tapEvent: "fdownVoices",
                    },
                    refush: {
                        itype: "icon",
                        src: "/images/loop.jpg",
                        tapEvent: "frefushVoices",
                    },
                    del: {
                        itype: "icon",
                        src: "/images/del.jpg",
                        tapEvent: "fdelVoices",
                    }
                }
            },
            network: null,
            key: {
                itype:"picker",
                pickarr:["en","zh"],
                sval:null
            },
            looplay:{
                itype:"picker",
                pickarr:["en","zh","none"],
                sval:null
            },
            lastLength: null,
            maxProgress: null,
            fzkts:{
                itype:"object",
                // style:"height:auto;border-top-left-radius: 21px;border-top-right-radius: 21px;",
                fswitch:"fswitchObj",
                pickarr:["en","envoice","enedi","enedit","zh","zhvoice","enedi","enedit","image"],
                sval:[null,//fzkt0
                    null,//fzkt1
                    null,//fzkt2
                    null,//fzkt3
                    null,//fzkt4
                    null,//fzkt5
                    null,//fzkt6
                    null,//fzkt7
                    null,//fzkt8
                    null,//fzkt9
                    null,//fzkt10
                    null,//fzkt11
                    null,//fzkt12
                    null,//fzkt13
                    null,//fzkt14
                    null,//fzkt15
                    null,//fzkt16
                    null,//fzkt17
                    null,//fzkt18
                    null,//fzkt19
                    null,//fzkt20
                    null,//fzkt21
                    null//fzkt99
                ]
            },
        },
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.utils.logs.linfo("on load sett page...")
        //refush files
        // this.frefushImages()
        // this.frefushVoices()
        //refush setts
        const setts = app.utils.setts.fcache()
        for (const sett in setts) {
            //sval
            if(this.data.setts[sett]==null){
                this.data.setts[sett]={}
            }
            this.data.setts[sett].sval=setts[sett]
            // itype
            if(this.data.setts[sett].itype==null){
                this.data.setts[sett].itype = (typeof setts[sett])
            }
            switch (this.data.setts[sett].itype) {
                case "boolean" :
                    // tap event
                    this.data.setts[sett].tapEvent = "fswitchBool"
                    break;
                case "picker":
                    if(this.data.setts[sett].sval instanceof Array==false){
                        this.data.setts[sett].sval = [this.data.setts[sett].sval]
                    }

                    //val to index
                    this.data.setts[sett].sval=this.data.setts[sett].sval.map(v=>this.data.setts[sett].pickarr.indexOf(v))

                    break;
            }
        }
        this.setData(this.data)
    },
    fswitchBool(e) {
        const params = e.target.dataset.event1Params1.split(";")
        const sett = params[0]
        var oldBool = this.data.setts[sett].sval
        this.saveSett({[sett]: !oldBool}, (code) => {
            if (code) {
                this.data.setts[sett].sval = !oldBool
                this.setData(this.data)
            }
        })
    },
    fswitchObj(e){
        const sk=e.target.dataset.event1Params1
        this.data.setts[sk].style=(this.data.setts[sk].style==""?"height:auto;border-bottom-left-radius: 21px;border-bottom-right-radius: 21px;border-top-left-radius:0px;border-top-right-radius:0px":"")
        this.setData(this.data)
    },
    frefushImages: function () {
        this.data.setts.images.butts.progress.pro = 0
        this.setData(this.data)
        this.refushs(["image"], this.upImgPro)
    },
    fdownImageToLocal: function () {
        app.utils.cfirms.fcshow("Are you sure you want to download the images again?",()=>{
            this.downIVs(["image"], this.upImgPro)
        },()=>{})

    },
    fdelImages: function () {
        this.removes(["image"], (keysLength) => {
            this.upImgPro(-keysLength)
        })
    },
    frefushVoices: function () {
        this.data.setts.voices.butts.progress.pro = 0
        this.setData(this.data)
        this.refushs(["zhvoice", app.utils.setts.fcache().skey + "voice"], this.upVoicePro)
    },
    fdownVoices: function () {
        app.utils.cfirms.fcshow("down voice by tts?", () => {
            this.downIVs(["zhvoice", app.utils.setts.fcache().skey + "voice"], this.upVoicePro, true)
        }, () => {
            this.downIVs(["zhvoice", app.utils.setts.fcache().skey + "voice"], this.upVoicePro)
        })
    },
    fdelVoices: function () {
        this.removes(["zhvoice", app.utils.setts.fcache().skey + "voice"], (keysLength) => {
            this.upVoicePro(-keysLength)
        })
    },
    fdownDBToLocal: function () {
        app.utils.cfirms.fcshow("Are you sure you want to download the database again?",()=>{
            app.utils.fs.fdel("db/",(code)=>{
                if(code){
                    this.fcleanDBCache(null,false)
                }else app.utils.cfirms.fcshow("del local database is fail.")
            })
        },()=>{})
    },
    fupDBToYun: function () {
        app.utils.db.fquery({field: {time: true}}, (lcode, lres) => {
            if (lcode) {
                app.utils.db.fquery({field: {time: true}}, (ycode, yres) => {
                    if (ycode) {
                        if (lres[0].time > yres[0].time) {
                            app.utils.cfirms.fcshow("本地数据库已修改,是否上传覆盖?", () => {
                                app.utils.db.fsaveToYun()
                            }, () => {
                            })
                        }
                    }
                }, true)
            }
        })
    },
    fcleanDBCache: function (e, isShow=true) {
        const clean=()=>{
            app.callbacks.push((code)=>{
                if(code){
                    this.onLoad()
                }else app.utils.cfirms.fcshow("down is fail.")
            })
            app.initAll(Object.values(app.utils),true)
        }
        //show firms
        if(isShow){
            app.utils.cfirms.fcshow("Are you sure you want to delete the database cache?",()=>{
                clean()
            },()=>{})
        }else clean()

    },
    upImgPro: function (keysLength) {
        this.data.setts.images.butts.progress.pro += (100 / keysLength)
        this.setData(this.data)
    },
    upVoicePro: function (keysLength) {
        this.data.setts.voices.butts.progress.pro += (100 / keysLength / 2)
        this.setData(this.data)
    },
    /**
     * get info,keys length kcode,loop callback
     * @param keys
     * @param callback
     */
    getIKLoopCallback(keys, callback) {
        app.utils.db.fquery({field: {infos: true, keys: true}}, (code, res) => {
            if (code) {
                const infos = res[0].infos
                const keysLength = res[0].keys.length
                Object.keys(infos).map(kcode => {
                    const info = infos[kcode]
                    keys.map(dkey => {
                        callback(dkey, info, keysLength, kcode)
                    })
                })
            }
        })
    },
    /**
     * down image or voice
     * @param dkeys
     * @param callback
     * @param isTTS
     */
    downIVs(dkeys, callback, isTTS) {
        this.getIKLoopCallback(dkeys, (dkey, info, keysLength, kcode) => {
            app.utils.fs.fexist(info[dkey], (scode) => {
                if (!scode) {
                    app.utils.fs.fdownYun(info[dkey], info[dkey], (dcode) => {
                        if (isTTS) {
                            app.utils.tts.fdownTTS(info, dkey, kcode, (tcode) => {
                                if (tcode) {
                                    callback(keysLength)
                                }
                            })
                        } else if (dcode) {
                            callback(keysLength)
                        }
                    })
                }
            })
        })
    },
    removes(dkeys, callback) {
        this.getIKLoopCallback(dkeys, (dkey, info, keysLength) => {
            app.utils.fs.fdel(info[dkey], (dcode) => {
                if (dcode) {
                    callback(keysLength)
                }
            })
        })
    },
    refushs(dkeys, callback) {
        this.getIKLoopCallback(dkeys, (dkey, info, keysLength) => {
            app.utils.fs.fexist(info[dkey], (ecode) => {
                if (ecode) {
                    callback(keysLength)
                }
            })
        })
    },
    saveSett(sett, callback) {
        app.utils.db.fupdate({settings: sett}, callback)
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})