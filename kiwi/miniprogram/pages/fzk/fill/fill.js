// miniprogram/pages/fill/fill.js
const app = getApp()
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
        ptype2: [],//[envoice,edi]
        dAnswer: {info: {}, vtype: "button", tapEvent: "fAClick"},
        imagepath:"",
        dInputs: [
            {text: "ab", itype: "", tapEvent: "", style: ""},
            {
                text: "cd",
                itype: "input",
                inputEvent: "fInputCheck",
                inputValue: "",
                focus: false,
                style: "width:calc(2 * 4vw)"
            },
            {
                text: "e",
                itype: "input",
                inputEvent: "fInputCheck", inputValue: "",
                focus: false,
                style: "width:calc(2 * 4vw)"
            },
        ],
        dCorr: {
            isCorr: null,
            tapEvent: "fCorrNext",
            jobCode: 0,
            clickc: 0,
        },
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const pams = JSON.parse(options.params)
        //ptype2
        this.data.ptype2 = pams.ptype2
        if (this.data.ptype2[0].endsWith(app.avoice.VC)) {
            this.data.ptype2[0] = app.avoice.VC
        }
        //progress
        this.data.dButtons[2].text = pams.progress
        if (pams.isErr) {
            this.data.dButtons[2].style += ";color:red"
        }
        //answer
        const info=pams.answerInfo
        this.data.dAnswer.info = info
        this.data.imagepath=app.afile.fgetFtpath(info.image)
        // edit
        const skey = pams.answerInfo[app.setts.key]
        if (this.data.ptype2[1] == "edit") {
            this.data.dInputs = [{
                text: skey,
                itype: "input",
                inputEvent: "fInputCheck", inputValue: "",
                focus: false,
                style: "width:calc( " + skey.length + " * 4vw )"
            }]
        } else {
            //edi get inputs by random
            this.data.dInputs = this.fGetInputsByRandom(pams.answerInfo)
        }

        this.setData(this.data)
        //play voice
        if (this.data.ptype2[0] == app.avoice.VC) {
            this.fAClick()
        }
    },
    fopenEdit() {
        app.afzk.fopenEdit(this.data.dAnswer.info[app.setts.key])
    },
    fInputCheck(e) {
        const inputs = this.data.dInputs
        const inputStr = e.detail.value.trim()
        const i = e.target.dataset.event1Params1
        //refush text
        inputs[i].inputValue = inputStr.substr(0, inputs[i].text.length)
        this.setData(this.data)
        //next input
        if (inputStr.length >= inputs[i].text.length) {
            //next focus
            var ni = this.focusNext(true)
            //check end
            const allInputStr = inputs.map(_ => _.itype == "input" ? _.inputValue : _.text).join("")
            const skey = this.data.dAnswer.info[app.setts.key]
            if (ni == null && allInputStr.length >= skey.length) {
                //corr next
                this.data.dCorr.isCorr = (allInputStr.trim().toLowerCase() == skey.toLowerCase())
                // this.data.dCorr.jobCode = setTimeout(() => {
                //     this.fCorrNext()
                // }, 3000)
                this.data.dCorr.jobCode=app.avoice.fplay("/voices/"+(this.data.dCorr.isCorr?"ok.mp3":"no.mp3"),(code)=>{
                    if(code){
                        // 回答正确才滴滴滴滴
                        if(this.data.dCorr.isCorr){
                            this.data.dCorr.jobCode=app.avoice.fplay("/voices/ddd.mp3",()=>{
                                if(code){
                                    this.fCorrNext()
                                }
                            })
                            this.setData(this.data)
                        }else this.fCorrNext()
                    }
                })
                this.data.dCorr.clickc += 1
                this.setData(this.data)
            }
        } else if (inputStr.length == "") {
            // pri
            this.focusNext(false)
        }
    },
    fCorrNext() {
        // clearTimeout(this.data.dCorr.jobCode)
        app.avoice.fstop(this.data.dCorr.jobCode)
        if (this.data.dCorr.clickc == 1 && this.data.dButtons[2].style.indexOf(";color:red") < 0) {
            app.afzk.fSaveCorr(this.data.dCorr.isCorr)
        }
        //必须选出正确答案才能下一个
        if (this.data.dCorr.isCorr) {
            app.afzk.fToPage(true)
        } else {
            this.data.dCorr.isCorr = null
            this.setData(this.data)
        }
    },
    focusNext(isNext, i) {
        const ds = this.data.dInputs
        const iarr = []
        for (var j in ds) {
            if (ds[j].itype == "input") {
                if (ds[j].focus == true) {
                    i = iarr.length
                }
                iarr.push(j)
            }
        }
        if (i >= null) {
            ds[iarr[i]].focus = false
        } else i = 0

        const ni = (isNext ? i + 1 : i - 1)
        var ndi = iarr[ni]
        if (ndi == null) {
            //last
            ds[iarr[i]].focus = true
            ndi = null
        } else {
            ds[ndi].focus = true
        }
        this.setData(this.data)
        return ndi
    },
    fGetInputsByRandom(info) {
        //by leaf apcxxdef=>apc$LEAF$def
        const LEAF = "$LEAF$"
        var skey = info[app.setts.key]
        const leafs = info.leafs.split(",")
        leafs.map(_ =>
            skey = skey.replace(_, LEAF)
        )

        //split all =>["a", "p", "c", "$LEAF$1", "d", "e", "f"]
        const SEP = "$SEP$"
        const karr = skey.split(LEAF).map((k, i) =>
                (i > 0 ? [LEAF + i].concat(k.split("")) : k.split("")).join(SEP)
        ).join(SEP).split(SEP)
        //if ["", "$LEAF$1", "a", "p", "c", "d", "e", "f"] remove ""
        if(karr[0]==""){
            karr.splice(0,1)
        }
        //to input
        var inputCount=0
        const inputs = []
        for (var i in karr) {
            var k = karr[i]
            //re leaf
            var isLeaf=false
            if (k.startsWith(LEAF)) {
                isLeaf=true
                k = leafs[k.split(LEAF)[1] - 1]
            }
            //add input
            if (i == 0 || k == " ") {
                //first or " " is text
                inputs.push({text: k, itype: "text", tapEvent: "", style: ""})
            } else {
                //需要输入的字母百分比
                if (Math.random() < app.setts.filLetteRadio||(i==leafs.length-1&&inputCount==0)) {
                    const aftInput = inputs[inputs.length - 1]
                    if (isLeaf==false&&aftInput.itype == "input" && Math.random() >= 0.5555) {
                        //随机合并 leaf not 合并
                        aftInput.text += k
                        aftInput.style = "width:calc( " + aftInput.text.length + " * 4vw )"
                    } else {
                        inputCount+=1
                        //new input
                        inputs.push({
                            text: k,
                            itype: "input",
                            inputEvent: "fInputCheck", inputValue: "",
                            focus: false,
                            style: "width:calc( " + k.length + " * 4vw )"
                        })
                    }
                } else {
                    // new text
                    inputs.push({text: k, itype: "", style: ""})
                }
            }
        }

        return inputs
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
    fNext(e) {
        app.afzk.fToPage(false, 1)
    },
    fLast(e) {
        app.afzk.fToPage(false, 99)
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