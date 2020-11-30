// miniprogram/pages/setting/setting.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        dSetts: [{
            skey: "skey",
            sval: [1],//必须用下标,否则会自动触发change
            itype: "picker",
            picarr:["aa","bb"],
            changeEvent: "pickChange"
        }],

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.initSetts(() => {
            this.reSettPage()
        })
    },
    reSettPage() {
        this.data.dSetts = []
        for (var skey in app.setts) {
            this.data.dSetts=this.data.dSetts.concat(this.getSettDs(skey, app.setts[skey]))
        }
        this.setData(this.data)
    },
    getSettDs(skey, sett) {
        const settDs=[{
            itype: (typeof sett),
            skey: skey,
            sval: sett,
            tapEvent: "fChebox"
        }]
        if(typeof sett=="object"){
            // 特殊
            if(sett.itype!=null){
                settDs[0].itype=sett.itype
                switch (sett.itype) {
                    case "picker":
                        settDs.splice(0,1)
                        for(const pk in sett){
                            if(["itype","picarr"].indexOf(pk)<0){
                                if(sett[pk] instanceof Array){
                                    settDs.push({
                                        itype:sett.itype,
                                        skey: skey+"."+pk,
                                        sval:sett[pk].map(v=>sett.picarr.indexOf(v)),//必须用下标,否则会自动触发change事件
                                        picarr:sett.picarr,
                                        changeEvent: "pickChange"
                                    })
                                }else settDs.push(this.getSettDs(skey+"."+pk,sett[pk])[0])
                            }
                        }
                        break;
                    case "buttons":
                        settDs[0].buttons=sett.buttons
                        settDs[0].buttons.map(button=>{
                            button.tapEvent="fButCli"
                        })
                        break;
                    case "progress":
                        settDs[0].tapEvent = "fProCli"
                        break;
                }
            }else{
                //折叠
                settDs[0].tapEvent="foldCli"
                settDs[0].isFold=false
                settDs[0].sval=[]
                for (var nskey in sett) {
                    settDs[0].sval=settDs[0].sval.concat(this.getSettDs(nskey, sett[nskey]))
                }
            }
        }
        return settDs
    },
    foldCli(e){
        const params = e.target.dataset.event1Params1.split(";")
        const di=params[1]
        var fold=this.data.dSetts[di]
        if(params.length>2){
            fold=fold.sval[params[2]]
        }
        this.data.dSetts[di].isFold=(!fold.isFold)
        this.setData(this.data)
    },
    fChebox(e) {
        const params = e.target.dataset.event1Params1.split(";")
        const kLink=params[0]
        const di = params[1]
        var oldSettBool = this.data.dSetts[di].sval
        if(params.length>2){
            oldSettBool=oldSettBool[params[2]].sval
        }
        const setting = this.kLinkToObj(kLink, !oldSettBool)
        this.saveSetting(setting)
    },
    fButCli(e) {
        const elink = e.currentTarget.dataset.event1Params1.split(";")[0].split(".")
        var ev = app
        for (var i in elink) {
            ev = ev[elink[i]]
        }
        if (typeof ev == "function") {
            ev(()=>{
                this.reSettPage()
            })
        }
    },
    pickChange(e) {
        const params = e.target.dataset.event1Params1.split(";")
        const kLink=params[0]
        const di = params[1]
        var picker=this.data.dSetts[di]
        if(params.length>2){
            picker=picker.sval[params[2]]
        }
        const newpicvali = []
        const newpicval = []
        const viarr = e.detail.value
        for (var i in viarr) {
            newpicvali.push(viarr[i])
            newpicval.push(picker.picarr[viarr[i]])
        }
        const setting = this.kLinkToObj(kLink, newpicval)
        this.saveSetting(setting)
    },
    kLinkToObj(kLink, sval) {
        var objStr = ("{\"" + kLink.replace(/\./g, "\":{\"") + "\":" + JSON.stringify(sval))
        for (var i = 0; i < kLink.split(".").length; i++) {
            objStr += "}"
        }
        return JSON.parse(objStr)
    },
    saveSetting(sett) {
        app.adatabase.dupdate({where: {_id: app.setts.subid}}, {
            settings: sett
        }, (code) => {
            if (code) {
                this.onLoad()
            } else {
                app.aconfirms.cshow("save setting is fail.")
            }
        })
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