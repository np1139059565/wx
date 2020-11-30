const app = getApp()
// miniprogram/pages/choice/choice.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        dButtons: [
            {text: "<<", vtype: "button", tapEvent: "fFirst", style: ""},
            {text: "<", vtype: "button", tapEvent: "fPri", style: ""},
            {text: "progress", vtype: "button", tapEvent: "fopenEdit", style: "width:calc(100vw / 6 * 2)"},
            {text: ">", vtype: "button", tapEvent: "fNext", style: ""},
            {text: ">>", vtype: "button", tapEvent: "fLast", style: ""},
        ],
        ptype2: [],//[envoice,en]
        dAnswer: {info: {}, vtype: "button", tapEvent: "fAClick"},
        imagePaths:{},
        dO4Options: [
            {vtype: "button", info: {}, tapEvent: "fOClick"},
            {vtype: "button", info: {}, tapEvent: "fOClick"},
            {vtype: "button", info: {}, tapEvent: "fOClick"},
            {vtype: "button", info: {}, tapEvent: "fOClick"},
        ],
        dCorr: {
            isCorr: null,
            tapEvent: "fCorrNext",
            jobCode: 0,
            clickc:0,
        },
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //{progress,answer,o4}
        const params = JSON.parse(options.params)
        //ptype2
        this.data.ptype2 = params.ptype2
        if (this.data.ptype2[0].endsWith(app.avoice.VC)) {
            this.data.ptype2[0] = app.avoice.VC
        }
        if (this.data.ptype2[1].endsWith(app.avoice.VC)) {
            this.data.ptype2[1] = app.avoice.VC
        }
        //progress
        this.data.dButtons[2].text = params.progress
        //is err
        if (params.isErr) {
            this.data.dButtons[2].style += ";color:red"
        }
        //answer
        this.data.dAnswer.info = params.answerInfo
        //o4
        for (var i in params.o4Infos) {
            const info=params.o4Infos[i]
            this.data.dO4Options[i].info = info
            this.data.imagePaths[info.image]=app.afile.fgetFtpath(info.image)
        }
        this.setData(this.data)
        //play voice
        if(this.data.ptype2[0]==app.avoice.VC){
            this.fAClick()
        }
    },

    fopenEdit() {
        app.afzk.fopenEdit(this.data.dAnswer.info[app.setts.key])
    },

    fFirst(e) {
        app.afzk.fToPage(false, -99)
    },
    fPri(e) {
        app.afzk.fToPage(false, -1)
    },
    fAClick(e) {
        app.avoice.fplayInfo(this.data.dAnswer.info, app.setts.key)
    },
    fOClick(e) {
        const o4i = e.currentTarget.dataset.event1Params1
        if (o4i >= 0) {
            const o4Info = this.data.dO4Options[o4i].info
            //next
            this.data.dCorr.isCorr = (this.data.dAnswer.info[app.setts.key] == o4Info[app.setts.key])
            // this.data.dCorr.jobCode = setTimeout(() => {
            //     this.fCorrNext()
            // }, 3000)
            this.data.dCorr.jobCode=app.avoice.fplay("/voices/"+(this.data.dCorr.isCorr?"ok.mp3":"no.mp3"),(code)=>{
                if(code){
                    this.data.dCorr.jobCode=app.avoice.fplay("/voices/ddd.mp3",()=>{
                        if(code){
                            this.fCorrNext()
                        }
                    })
                }
            })
            this.data.dCorr.clickc+=1
            this.setData(this.data)
        }
    },
    fNext(e) {
        app.afzk.fToPage(false, 1)
    },
    fLast(e) {
        app.afzk.fToPage(false, 99)
    },
    fCorrNext() {
        // clearTimeout(this.data.dCorr.jobCode)
        app.avoice.fstop(this.data.dCorr.jobCode)
        if(this.data.dCorr.clickc==1&&this.data.dButtons[2].style.indexOf(";color:red")<0){
            app.afzk.fSaveCorr(this.data.dCorr.isCorr)
        }
        //必须选出正确答案才能下一个
        if(this.data.dCorr.isCorr){
            app.afzk.fToPage(true)
        }else {
            this.data.dCorr.isCorr=null
            this.setData(this.data)
        }
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