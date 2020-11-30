//index.js
const app = getApp()
//trend add index.json
import * as echarts from 'ec-canvas/echarts'

var echartClass = null
Page({//=>方式写的函数才能调用this.data
    data: {
        dButtons: [
            {text: "subject", tapEvent: "fOpenSubjectList", style: "", img: "/images/refush.jpg"},
            {text: "+", tapEvent: "fAdd", style: "", img: "/images/add.jpg"},
            {text: "edit", tapEvent: "fEdit", style: "", img: "/images/edit.jpg"},
            {text: "trend", tapEvent: "fOpenTrend", style: "", img: "/images/trend.jpg"},
            {text: "graph", tapEvent: "fOpenGraph", style: "", img: "/images/graph.jpg"},
            {text: "looplay", tapEvent: "fSwitchLoopPlay", style: "", img: "/images/loop.jpg"},
            {text: "setting", tapEvent: "fOpenSettingPage", style: "", img: "/images/setting.jpg"},
            {text: "del", tapEvent: "fDel", style: "", img: "/images/del.jpg"},
            {text: "fzk", tapEvent: "fOpenFZK", style: "", img: ""},
        ],
        dSubjects: {},//{subject:id}
        dTable: {
            style: "",
            id: "",
            search: {
                stype: "all",
                stext: "",
                reStEvent: "fRefushStype",
                inputEvent: "fReTableSearch"
            },
            sort: {
                sindex: -1,
                stype: "desc"
            },
            head: [
                {
                    text: "en",
                    tapEvent: "",
                    vtype: "",//body td value type
                },
                {
                    text: "h1",
                    tapEvent: ""
                }
            ],
            body: [
                [
                    {
                        text: "en1",
                        tapEvent: "",
                        isChecked: false
                    },
                    {
                        text: ".,,/...",
                        vtype: "voice",
                        tapEvent: ""
                    }
                ]
            ],
            isopenCheckboxAll: false,
            allCheckedCallback: () => {
            },
            isOpenTrCheck: false,
            trCheckedCallback: () => {
            },
            buttons: [
                {text: "<<", vtype: "button", tapEvent: "fTableFirst", style: ""},
                {text: "<", vtype: "button", tapEvent: "fTablePri", style: ""},
                {
                    text: "thi",
                    vtype: "number",
                    inputValue: 1,
                    inputEvent: "fTableReThi",
                    style: "text-align: right;height:5vh"
                },
                {text: 1, vtype: "button", tapEvent: "", style: "text-align: left;"},
                {text: "length", vtype: "number", inputValue: 10, inputEvent: "fTableReLen", style: "height:5vh"},
                {text: ">", vtype: "button", tapEvent: "fTableNext", style: ""},
                {text: ">>", vtype: "button", tapEvent: "fTableLast", style: ""},
            ],
            tableInfos: {}
        },

        // trend
        dTrend: {
            ec1: {//def key
                onInit: (canvas, width, height, dpr) => {
                    console.info("iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii",dpr)
                    const class1 = echarts.init(canvas, null, {
                        width: width,
                        height: height,
                        devicePixelRatio: dpr // 像素
                    })
                    canvas.setChart(class1)

                    class1.setOption({})
                    echartClass = class1
                    return class1
                },
            },
            style: "",
            offset: 0,//offset day>>-
            isOpenButton: true,
            buttons: [
                {text: "count", tapEvent: "fSwitchData", nodek: "c", vtype: "datatype", style: ""},
                {
                    text: "error",
                    tapEvent: "fSwitchData",
                    nodek: "e",
                    vtype: "datatype",
                    style: "border-bottom:1px solid"
                },
                {text: "day", tapEvent: "fSwitchData", nodek: "d", vtype: "datatime", style: ""},
                {text: "week", tapEvent: "fSwitchData", nodek: "w", vtype: "datatime", style: ""},
                {text: "month", tapEvent: "fSwitchData", nodek: "m", vtype: "datatime", style: ""},
            ],
            isOpenButton2: false,
            buttons2: [
                {text: "<<", vtype: "button", tapEvent: "fTrendFirst", style: ""},
                {text: "<", vtype: "button", tapEvent: "fTrendPri", style: ""},
                {
                    text: "length",
                    vtype: "input",
                    inputValue: 7,
                    inputEvent: "fTrendReLen",
                    style: "text-align: center;"
                },
                {text: ">", vtype: "button", tapEvent: "fTrendNext", style: ""},
                {text: ">>", vtype: "button", tapEvent: "fTrendLast", style: ""},
            ],
            countsByKcode: {}
        },

        //looplay
        dLooplay: {
            isOpen: false,
            progress: -1,
        }
    },
    //default event
    onLoad() {
        //close trend
        this.data.dTable.style = "height: calc(100vh - 5vh - 1vh)"
        this.data.dTrend.style = "display:none"
        //init subjects
        app.adatabase.dQuery({limit: 10, field: {subject: true}}, (code, res) => {
            this.data.dSubjects = {}
            if(code){
                var thisSub=null
                for (var i in res) {
                    this.data.dSubjects[res[i].subject] = res[i]._id
                    //init settings default 0
                    if (i == 0||app.setts.defSub==res[i].subject) {
                        app.setts.subid = res[i]._id
                        thisSub=res[i].subject
                    }
                }
                this.changeSubject(thisSub )
            }else app.aconfirms.cshow("init subject is fail")
            this.setData(this.data)
        })
    },

    //buttons event
    changeSubject(subtext) {
        //init subtext
        for (var i in this.data.dButtons) {
            if (this.data.dButtons[i].tapEvent == "fOpenSubjectList") {
                this.data.dButtons[i].text = subtext
            }
        }
        // init settings
        app.initSetts(() => {
            //is open fzk button
            if (app.setts.fzk.show) {
                this.data.dButtons[this.data.dButtons.length - 1].style = "display:block"
            } else this.data.dButtons[this.data.dButtons.length - 1].style = "display:none"
            //refush table
            this.fRefushTable()
        })
    },
    fOpenSubjectList(e) {
        const subarr = []
        for (var subject in this.data.dSubjects) {
            subarr.push(subject)//[{subid:subtext}...]
        }
        app.aconfirms.cshowList(subarr, (subtext) => {
            this.changeSubject(subtext)
        })
    },

    fAdd(e) {
        this.toEditPage()
    },
    fDel(e) {
        const bi = e.target.dataset.event1Params1
        if (this.data.dTable.isOpenTrCheck) {
            //check is open other check
            if (this.data.dButtons[bi].style == "") {
                app.aconfirms.cshow("check is open!")
            } else {
                this.data.dButtons[bi].style = ""
                this.closeCheckboxAll()
                this.closeTrCheck()

                //get keys,infos,counts,fids
                const keys = []
                const infos = {}
                const counts = {}
                const fids = []
                for (var ri in this.data.dTable.body) {
                    if (this.data.dTable.body[ri][0].isChecked) {
                        const skey = this.data.dTable.body[ri][0].text
                        const skcode = skey.split("").map(_ => _.charCodeAt()).join("")
                        keys.push(skey)
                        infos[skcode] = 1
                        counts[skcode] = 1
                        const tr = this.data.dTable.body[ri]
                        //find file ids
                        for (var di in tr) {
                            if (["string", "number", "boolean"].indexOf(this.data.dTable.head[di].vtype) < 0) {
                                fids.push(tr[di].text)
                            }
                        }
                    }
                }

                //delete
                if (keys.length > 0) {
                    app.aconfirms.cshow("del " + keys.join(",") + "?", () => {
                        app.adatabase.dkiwiRemove(app.setts.subid, {
                            keys: keys,
                            infos: infos,
                            counts: counts
                        }, (code) => {
                            if (code) {
                                //del file
                                if (fids.length > 0) {
                                    app.afile.fremoveLYFile(fids, (code2) => {
                                        if (!code2) app.aconfirms.cshow("del image is " + code2)
                                    })
                                }

                                this.fRefushTable()
                            } else app.aconfirms.cshow("del tr is " + code)
                        })
                    }, () => {
                    })
                }
            }

        } else {
            // open del
            this.data.dButtons[bi].style = "border-bottom:1px solid"
            this.openCheckboxAll()
            this.openTrCheck()
        }
    },
    fEdit(e) {
        const bi = e.target.dataset.event1Params1
        if (this.data.dTable.isOpenTrCheck) {
            //check is open other check
            if (this.data.dButtons[bi].style == "") {
                app.aconfirms.cshow("check is open!")
            } else {
                this.data.dButtons[bi].style = ""
                this.closeTrCheck()
            }
        } else {
            //edit style
            this.data.dButtons[bi].style = "border-bottom:1px solid"
            //open edit
            this.openTrCheck((e) => {
                const keyItem = this.data.dTable.body[e.target.dataset.event1Params1][0]
                this.toEditPage(keyItem.text)
                //not checked
                keyItem.isChecked = false
                this.setData(this.data)
            })
        }
    },

    fSwitchLoopPlay(e) {
        const bi = e.target.dataset.event1Params1
        if (this.data.dTable.isOpenTrCheck) {
            //check is open other check
            if (this.data.dButtons[bi].style == "") {
                app.aconfirms.cshow("check is open!")
            } else {
                this.data.dButtons[bi].style = ""
                this.data.dLooplay.isOpen = false
                this.closeCheckboxAll()
                this.closeTrCheck()
            }
        } else {
            // open del
            this.data.dButtons[bi].style = "border-bottom:1px solid"
            this.data.dLooplay.isOpen = true
            this.openCheckboxAll()
            this.openTrCheck()
            this.loopPlay()
        }
    },
    loopPlay() {
        if (this.data.dLooplay.isOpen) {
            const trs = this.data.dTable.body.filter(tr=>tr[0].isChecked)
            //loop by progress
            if (this.data.dLooplay.progress >= trs.length-1) {
                this.data.dLooplay.progress = -1
            }
            const tr = trs[this.data.dLooplay.progress += 1]
            const floop = () => {
                setTimeout(() => {
                    this.loopPlay()
                }, app.setts.looplay.watime)
            }

            if (tr && tr[0].isChecked) {
                const skey = tr[0].text
                const skcode = skey.split("").map(_ => _.charCodeAt()).join("")
                const tableInfos = this.data.dTable.tableInfos
                const k0 = app.setts.looplay.ps[0]
                const f0 = (callback) => {
                    app.avoice.fplayInfo(tableInfos[skcode], k0, callback)
                }
                const k1 = app.setts.looplay.ps[1]
                const f1 = () => {
                    if (k1 == "none") {
                        floop()
                    } else {
                        app.avoice.fplayInfo(tableInfos[skcode], k1, floop)
                    }
                }

                if (k0 == "none") {
                    f1()
                } else f0(f1)


            } else {
                floop()
            }
            this.setData(this.data)
        }
    },
    fOpenFZK(e) {
        if (app.afzk.fGetFZKThi() >= 0) {
            app.aconfirms.cshow("refush progress?", () => {
                app.afzk.fRefushFZK(app.setts.subid, this.getDayByThi(), this.getYWeekByThi(), this.getMonthByThi(), true)
            }, () => {
                app.afzk.fRefushFZK(app.setts.subid, this.getDayByThi(), this.getYWeekByThi(), this.getMonthByThi())
            })
        } else app.afzk.fRefushFZK(app.setts.subid, this.getDayByThi(), this.getYWeekByThi(), this.getMonthByThi(), true)
    },
    fOpenSettingPage(e) {
        wx.navigateTo({
            url: "/pages/setting/setting",
        })
    },

    //table event
    fRefushStype(e) {
        app.aconfirms.cshowList(
            //图片和音频不可搜索
            ["all"].concat(this.data.dTable.head.filter(h => ["image", "voice"].indexOf(h.vtype) < 0).map(h => h.text)), (stype) => {
                this.data.dTable.search.stype = stype
                this.setData(this.data)
                this.fRefushTable()
            })
    },
    fReTableSearch(ev) {
        var inputValue = ev.detail.value.trim()
        if (inputValue != this.data.dTable.search.stext) {
            this.data.dTable.buttons[2].inputValue = 1
            this.data.dTable.search.stext = inputValue
            this.setData(this.data)
            this.fRefushTable()
        }
    },
    fTableSort(e) {
        if (this.data.dTable.sort.sindex == e.target.dataset.event1Params1) {
            if (this.data.dTable.sort.stype == "desc") {//switch sort type
                this.data.dTable.sort.stype = "asc"
            } else this.data.dTable.sort.stype = "desc"
        } else {//switch sort index
            this.data.dTable.sort.sindex = e.target.dataset.event1Params1
        }
        this.setData(this.data)
        this.fRefushTable()
    },
    fAllChecked(e) {
        //re checked
        this.data.dTable.head[0].isChecked = (!this.data.dTable.head[0].isChecked)
        for (var j in this.data.dTable.body) {
            this.data.dTable.body[j][0].isChecked = this.data.dTable.head[0].isChecked
        }
        this.setData(this.data)
        //run callback
        if (typeof this.data.dTable.allCheckedCallback == "function") {
            this.data.dTable.allCheckedCallback(e)
        }
    },
    trchecked(e) {
        //re checked
        for (var trIndex in this.data.dTable.body) {
            if (e.target.dataset.event1Params1 == trIndex) {
                this.data.dTable.body[trIndex][0].isChecked = (!this.data.dTable.body[trIndex][0].isChecked)
                this.setData(this.data)
            }
        }
        //run callback
        if (typeof this.data.dTable.trCheckedCallback == "function") {
            this.data.dTable.trCheckedCallback(e)
        }
    },
    playVoice(e) {
        //text: ,skey:,hval:,vtype: ,tapEvent:
        const params = e.target.dataset.event1Params1
        const skcode = params.skey.split("").map(_ => _.charCodeAt()).join("")
        app.avoice.fplayInfo(this.data.dTable.tableInfos[skcode], params.hval)
    },
    fRefushTable() {
        app.adatabase.dQuery({
            where: {_id: app.setts.subid},
            field: {heads: true, keys: true, infos: true}
        }, (code, res) => {
            this.data.dTable.head = []
            // body clean
            this.data.dTable.body = []
            this.data.dTable.tableInfos = {}
            if(code){
                // head
                const heads = res[0].heads
                const hds = this.data.dTable.head
                for (var i in heads) {
                    const hval = heads[i].text
                    const htype = heads[i].vtype
                    const head = heads[i]

                    //head td
                    if (hval == app.setts.key) {//key def index 0
                        Object.assign(head, {
                            tapEvent: "fAllChecked",
                            isChecked: false,
                            isKey: true,
                        })
                        hds.splice(0, 0, head)
                    } else {
                        if (htype == "number") {
                            head.tapEvent = "fTableSort"
                        }
                        hds.push(head)
                    }
                }
                //search
                const infos = res[0].infos
                const skeys = res[0].keys
                if (this.data.dTable.search.stext != "") {
                    const stext = this.data.dTable.search.stext
                    const stype = this.data.dTable.search.stype
                    for (var i = skeys.length - 1; i >= 0; i--) {
                        const skey = skeys[i]
                        const skcode = skey.split("").map(_ => _.charCodeAt()).join("")
                        const info = infos[skcode]
                        var wtext = ""
                        if (info != null) {
                            if (stype.trim() != "all") {
                                if (info[stype] != null) {
                                    wtext = info[stype]
                                }
                            } else {
                                for (var k in info) {
                                    wtext += (" " + info[k])
                                }
                            }
                        }

                        if (typeof wtext == "number") {
                            wtext = wtext.toString()
                        }
                        if (wtext.toLowerCase().indexOf(stext.toLowerCase()) == -1) {
                            skeys.splice(i, 1)
                        }
                    }
                }
                //sort
                const stype = this.data.dTable.sort.stype
                const sindex = this.data.dTable.sort.sindex
                if (sindex >= 0) {
                    skeys.sort((k2, k1) => {
                        const k2code = k2.split("").map(_ => _.charCodeAt()).join("")
                        const k1code = k1.split("").map(_ => _.charCodeAt()).join("")
                        if (stype == "desc") {
                            return infos[k2code][hds[sindex].text] - infos[k1code][hds[sindex].text]
                        } else {
                            return infos[k1code][hds[sindex].text] - infos[k2code][hds[sindex].text]
                        }
                    })
                }

                //page
                const min = (this.data.dTable.buttons[2].inputValue - 1) * this.data.dTable.buttons[4].inputValue
                const max = min + parseInt(this.data.dTable.buttons[4].inputValue)
                for (var i = min; i < (max <= skeys.length ? max : skeys.length); i++) {
                    const skey = skeys[i]
                    const skcode = skey.split("").map(_ => _.charCodeAt()).join("")
                    var info = infos[skcode]
                    if (!info) {
                        info = {}
                    } else {
                        //cache
                        this.data.dTable.tableInfos[skcode] = info
                    }

                    // tr
                    const tr = []
                    for (var hi in this.data.dTable.head) {
                        //td
                        const hvalue = this.data.dTable.head[hi].text
                        const htype = this.data.dTable.head[hi].vtype
                        var dvalue = info[hvalue]
                        //default td value
                        if (dvalue == null) {
                            dvalue = (htype == "number" ? 0 : "")
                        }
                        //img is show
                        var dtype = htype
                        if (dtype == "image") {
                            dvalue = app.afile.fgetFtpath(dvalue)
                            if (dvalue == null) {
                                dvalue = "/images/inull.jpg"
                            }
                        }
                        var tevent = ""
                        if (dtype == "voice") {
                            if ([null, ""].indexOf(dvalue) < 0 && app.afile.fgetFtpath(dvalue) != null) {
                                tevent = "playVoice"
                                dvalue = "/images/voice.jpg"
                            } else dvalue = "/images/vnull.jpg"
                        }

                        //key
                        if (hvalue == app.setts.key) {
                            tr.splice(0, 0, {
                                text: dvalue,
                                cheEvent: "trchecked",
                                isChecked: false,
                                isKey: true,
                                skey: skey,
                                hval: hvalue,
                                vtype: dtype
                            })
                        } else {
                            tr.push({
                                text: dvalue,
                                skey: skey,
                                hval: hvalue,
                                vtype: dtype,
                                tapEvent: tevent
                            })
                        }
                    }

                    this.data.dTable.body.push(tr)
                }
                // page info
                const maxi = skeys.length / this.data.dTable.buttons[4].inputValue
                this.data.dTable.buttons[3].text = parseInt(maxi) + (maxi % 1 > 0 ? 1 : 0)
            }else app.aconfirms.cshow("re table is fail.")

            this.setData(this.data)
        })
    },
    fTableFirst() {
        if (this.data.dTable.buttons[2].inputValue > 1) {
            this.data.dTable.buttons[2].inputValue = 1
            this.setData(this.data)
            this.fRefushTable()
        }
    },
    fTablePri() {
        if (this.data.dTable.buttons[2].inputValue > 1) {
            this.data.dTable.buttons[2].inputValue -= 1
            this.setData(this.data)
            this.fRefushTable()
        }
    },
    fTableReThi(ev) {
        var newI = ev.detail.value.trim()
        if (newI >= 1 && newI <= this.data.dTable.buttons[3].text && newI != this.data.dTable.buttons[2].inputValue) {
            this.data.dTable.buttons[2].inputValue = newI
            this.setData(this.data)
            this.fRefushTable()
        }
    },
    fTableReLen(ev) {
        var newL = ev.detail.value.trim()
        if (newL >= 1 && newL != this.data.dTable.buttons[4].inputValue) {
            if (newL > 100) {
                newL = 100
            }
            this.data.dTable.buttons[4].inputValue = newL
            this.setData(this.data)
            this.fRefushTable()
        }
    },
    fTableNext() {
        if (this.data.dTable.buttons[2].inputValue < this.data.dTable.buttons[3].text) {
            this.data.dTable.buttons[2].inputValue += 1
            this.setData(this.data)
            this.fRefushTable()
        }
    },
    fTableLast() {
        if (this.data.dTable.buttons[2].inputValue < this.data.dTable.buttons[3].text) {
            this.data.dTable.buttons[2].inputValue = this.data.dTable.buttons[3].text
            this.setData(this.data)
            this.fRefushTable()
        }
    },

    // trend
    fOpenTrend(e, isGraph) {
        const bi = e.target.dataset.event1Params1
        if (this.data.dTable.isOpenTrCheck) {
            //check is open other check
            if (this.data.dButtons[bi].style == "") {
                app.aconfirms.cshow("check is open!")
            } else {
                this.data.dButtons[bi].style = ""
                this.data.dTable.style = "height: calc(100vh - 5vh - 1vh)"
                this.data.dTrend.style = "display:none"
                this.closeCheckboxAll()
                this.closeTrCheck()
            }
        } else {
            // open trend
            this.data.dButtons[bi].style = "border-bottom:1px solid"
            this.data.dTable.style = ""
            this.data.dTrend.style = ""
            //open check
            this.openCheckboxAll(() => {
                this.data.dTrend.countsByKcode = null
                // refush trend or graph
                if (isGraph) {
                    this.refushGraph(true)
                } else {
                    this.data.dTrend.isOpenButton = true
                    this.data.dTrend.isOpenButton2 = true
                    this.refushTrend()
                }
            })
            this.openTrCheck(() => {
                this.data.dTrend.countsByKcode = null
                // refush trend or graph
                if (isGraph) {
                    this.refushGraph(true)
                } else {
                    this.data.dTrend.isOpenButton = true
                    this.data.dTrend.isOpenButton2 = true
                    this.refushTrend()
                }
            })
            // refush trend or graph
            if (isGraph) {
                this.refushGraph()
            } else {
                this.data.dTrend.isOpenButton = true
                this.data.dTrend.isOpenButton2 = true
                this.refushTrend()
            }
        }
    },
    fSwitchData(e) {
        const button = this.data.dTrend.buttons[e.target.dataset.event1Params1]
        if (button.style == "") {
            //switch style
            for (var bi in this.data.dTrend.buttons) {
                if (this.data.dTrend.buttons[bi].vtype == button.vtype) {
                    this.data.dTrend.buttons[bi].style = ""
                }
            }
            button.style = "border-bottom:1px solid"
            this.setData(this.data)
            //refush trend by vtype
            if (button.vtype == "datatype") {
                this.refushTrend(button.nodek, null)
            } else if (button.vtype == "datatime") {
                this.refushTrend(null, button.nodek)
            }
        } else if (button.vtype == "datatime") {//数据时间可以不选,默认为总数
            button.style = ""
            this.setData(this.data)
            this.refushTrend()
        }
    },
    fTrendFirst() {
        if (this.data.dTrend.offset < 365) {
            this.data.dTrend.offset = 365
            this.setData(this.data)
            this.refushTrend()
        }
    },
    fTrendPri() {
        if (this.data.dTrend.offset < 365) {
            this.data.dTrend.offset += 1
            this.setData(this.data)
            this.refushTrend()
        }
    },
    fTrendReLen(ev) {
        var newL = ev.detail.value.trim()
        if (newL >= 7 && newL != this.data.dTrend.buttons2[2].inputValue) {
            if (newL > 30) {
                newL = 30
            }
            this.data.dTrend.buttons2[2].inputValue = newL
            this.setData(this.data)
            this.refushTrend()
        }
    },
    fTrendNext() {
        if (this.data.dTrend.offset > 0) {
            this.data.dTrend.offset -= 1
            this.setData(this.data)
            this.refushTrend()
        }
    },
    fTrendLast() {
        if (this.data.dTrend.offset > 0) {
            this.data.dTrend.offset = 0
            this.setData(this.data)
            this.refushTrend()
        }
    },
    // graph
    fOpenGraph(e) {
        this.fOpenTrend(e, true)
    },

    //private event
    closeCheckboxAll() {
        this.data.dTable.isopenCheckboxAll = false
        this.data.dTable.allCheckedCallback = ""
        this.setData(this.data)
    },
    openCheckboxAll(allCheckedCallback1) {
        //is open check all
        this.data.dTable.isopenCheckboxAll = true
        this.data.dTable.allCheckedCallback = allCheckedCallback1
        //no checked
        for (const i in this.data.dTable.head) {
            if (this.data.dTable.head[i].isChecked != null) {
                this.data.dTable.head[i].isChecked = false
            }
        }
        this.setData(this.data)
    },
    closeTrCheck() {
        this.data.dTable.isOpenTrCheck = false
        this.data.dTable.trCheckedCallback = ""
        this.setData(this.data)
    },
    openTrCheck(trCheckedCallback1) {
        //is open tr check
        this.data.dTable.isOpenTrCheck = true
        this.data.dTable.trCheckedCallback = trCheckedCallback1
        //no checked
        for (const i in this.data.dTable.body) {
            for (var j in this.data.dTable.body[i]) {
                if (this.data.dTable.body[i][j].isChecked != null) {
                    this.data.dTable.body[i][j].isChecked = false
                }
            }
        }
        this.setData(this.data)
    },
    toEditPage(skey) {
        wx.navigateTo({
            url: "/pages/edit/edit?isAdd="+(skey!=null?"false":"true") + "&skey=" + (skey != null ? skey : ""),
        })
    },

    // trend
    refushTrend(dType, dTime) {
        //find data type,time
        if (dType == null || dTime == null) {
            for (var i in this.data.dTrend.buttons) {
                const bt = this.data.dTrend.buttons[i]
                if (bt.style != "") {
                    switch (bt.vtype) {
                        case "datatype":
                            if (dType == null) {
                                dType = bt.nodek
                            }
                            break;
                        case "datatime":
                            if (dTime == null) {
                                dTime = bt.nodek
                            }
                            break;
                    }
                }
            }
        }
        // find checked data keys
        const checkedKeys = []
        for (var i in this.data.dTable.body) {
            const td = this.data.dTable.body[i][0]
            if (td.isChecked) {
                checkedKeys.push(td.text)
            }
        }
        //refush trend by data time
        if (dTime == null) {
            this.refushBar(dType, checkedKeys)
        } else this.refushLine(dType, dTime, checkedKeys)
    },
    refushBar(dType, keys) {
        //close button2
        this.data.dTrend.isOpenButton2 = false
        this.setData(this.data)
        //options
        const options = {
            tooltip: {
                show: true,
                trigger: 'axis',
            },
            color: [dType == "c" ? "green" : "red"],
            xAxis: {
                type: 'category',
                data: []
            },

            yAxis: {
                type: 'value',
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                }
            },
            series: [{
                type: "bar",
                data: []
            }]
        }
        for (var i in keys) {
            const skcode = keys[i].split("").map(_ => _.charCodeAt()).join("")
            options.xAxis.data.push(keys[i])
            options.series[0].data.push(this.data.dTable.tableInfos[skcode][dType])
        }
        echartClass.setOption(options, true)//cover options
    },
    refushLine(dType, dTime, keys) {
        if (this.data.dTrend.countsByKcode == null) {
            //query data
            app.adatabase.dQuery({
                where: {_id: app.setts.subid},
                field: {counts: true}
            }, (code, res) => {
                if(code){
                    //refush cache counts
                    this.data.dTrend.countsByKcode = {}
                    for (var ki in keys) {
                        const skcode = keys[ki].split("").map(_ => _.charCodeAt()).join("")
                        var obj = res[0].counts[skcode]
                        if (obj == null) {
                            obj = {d: {}, w: {}, m: {}}
                        }
                        this.data.dTrend.countsByKcode[skcode] = obj
                    }
                    this.refushTrend(dType, dTime, keys)
                }else app.aconfirms.cshow("re line is fail.")
            })
        } else {
            //options
            var options = {
                tooltip: {
                    show: true,
                    trigger: 'axis'
                },
                color: [dType == "c" ? "green" : "red"],
                xAxis: {
                    type: 'category',
                    data: []
                },
                yAxis: {
                    type: 'value',
                    splitLine: {
                        lineStyle: {
                            type: 'dashed'
                        }
                    }
                },
                series: []
            }
            //parse key
            for (var ki in keys) {
                const counts = this.data.dTrend.countsByKcode
                const skcode = keys[ki].split("").map(_ => _.charCodeAt()).join("")
                var obj = counts[skcode]
                if (obj == null) {//obj == null stop this,refush query
                    this.refushLine(dType, dTime, keys)
                    options = null
                    break;
                }

                //open button2
                this.data.dTrend.isOpenButton2 = true
                this.setData(this.data)

                const serie = {
                    name: keys[ki],
                    type: "line",
                    data: []
                }
                //get len data
                for (var di = this.data.dTrend.buttons2[2].inputValue - 1; di >= 0; di--) {
                    var time = this.getDayByThi(di + this.data.dTrend.offset)
                    var td
                    //get td by time
                    switch (dTime) {
                        case "d":
                            td = obj.d[time]
                            break;
                        case "w":
                            time = this.getYWeekByThi(di)
                            td = obj.w[time]
                            break;
                        case "m":
                            time = this.getMonthByThi(di)
                            td = obj.m[time]
                            break;
                    }
                    //get data by type
                    if (td == null) {
                        td = "--"
                    } else td = td[dType]
                    serie.data.push(td)
                    //add times
                    if (options.series.length == 0) {
                        options.xAxis.data.push(time)
                    }
                }
                options.series.push(serie)
            }
            if (options != null) {
                echartClass.setOption(options, true)//cover options
            }
        }
    },
    getDayByThi(len = 0) {
        const tday = new Date()
        tday.setHours(12, 0, 0, 0)
        return new Date(tday.getTime() - (len * 24 * 60 * 60 * 1000)).toJSON().split("T")[0]
    },
    getYWeekByThi(len = 0) {
        const tdInfo = this.getDayByThi(0).split("-")
        const tday = new Date(tdInfo[0], parseInt(tdInfo[1]) - 1, tdInfo[2]),//this day
            yfday = new Date(tdInfo[0], 0, 1),//year first day
            dcount = Math.round((tday.valueOf() - yfday.valueOf()) / 86400000);
        const tweek = Math.ceil((dcount + ((yfday.getDay() + 1) - 1)) / 7) - len
        return tdInfo[0] + "-w-" + tweek
    },
    getMonthByThi(len = 0) {
        const tdInfo = this.getDayByThi(0).split("-")
        return tdInfo[0] + "-m-" + (parseInt(tdInfo[1]) - len)
    },
    //graph
    refushGraph(isByChecked) {
        this.data.dTrend.isOpenButton = false
        this.data.dTrend.isOpenButton2 = false
        this.setData(this.data)
        app.adatabase.dQuery({
            where: {_id: app.setts.subid},
            field: {infos: true, keys: true}
        }, (code, res) => {
            if(code){
                const skeys = res[0].keys
                const infos = res[0].infos
                const darr = []
                const darrks = {}
                const dxy = {}
                const larr = []
                const larrkeys = {}
                const forEvent = (i) => {
                    var isChecked = false
                    if (isByChecked) {
                        for (const j in this.data.dTable.body) {
                            if (skeys[i] == this.data.dTable.body[j][0].text && this.data.dTable.body[j][0].isChecked) {
                                isChecked = true
                            }
                        }
                    }
                    if ((isByChecked && isChecked) || isByChecked == null) {
                        const skey = skeys[i]
                        const skcode = skey.split("").map(_ => _.charCodeAt()).join("")
                        const info = infos[skcode]
                        const leafs = info.leafs.length > 0 ? info.leafs.split(",") : []

                        //parse leafs
                        var x0 = 0
                        for (var i in leafs) {
                            const lkey = leafs[i]
                            //parse leaf
                            if (skeys.indexOf(lkey) >= 0) {
                                forEvent(skeys.indexOf(lkey))
                            }
                            // find x0
                            if (darrks[lkey] != null && x0 < darrks[lkey].x) {
                                x0 = darrks[lkey].x
                            }
                        }
                        //init y0
                        if (dxy["x" + x0] == null) {
                            dxy["x" + x0] = {
                                yl: 0
                            }
                        }
                        //init y1
                        if (dxy["x" + (x0 + 1)] == null) {
                            dxy["x" + (x0 + 1)] = {
                                yl: 0
                            }
                        }
                        //leafs to darr,larr
                        for (var j in leafs) {
                            if (darrks[leafs[j]] == null) {
                                darrks[leafs[j]] = {
                                    "id": leafs[j],
                                    "name": leafs[j],
                                    "symbolSize": 20,
                                    x: x0,
                                    y: dxy["x" + x0].yl
                                }
                                dxy["x" + x0].yl += 1
                                darr.push(darrks[leafs[j]])
                            }
                            //leafs to larr
                            if (larrkeys[leafs[j] + ">>" + skey] == null) {
                                larrkeys[leafs[j] + ">>" + skey] == 1
                                darrks[leafs[j]].symbolSize += 0.2
                                larr.push({
                                    source: leafs[j],
                                    target: skey,
                                })
                            }
                        }
                        //node to darr
                        if (darrks[skcode] == null) {
                            darrks[skcode] = {
                                "id": skey,
                                "name": skey,
                                "symbolSize": 20,
                                x: (x0 + 1),
                                y: dxy["x" + (x0 + 1)].yl
                            }
                            dxy["x" + (x0 + 1)].yl += 1
                            darr.push(darrks[skcode])
                        }
                    }
                }
                for (var i in skeys) {
                    forEvent(i)
                }
                echartClass.setOption({
                    series: [
                        {
                            type: 'graph',
                            focusNodeAdjacency: true,//在鼠标移到节点上的时候突出显示节点以及节点的边和邻接节点
                            symbolSize: 20,
                            roam: true,
                            lineStyle: {
                                curveness: 0.000001,
                            },
                            draggable: true,//移动
                            // label: {show: true},//默认打开字符
                            edgeSymbol: ['circle', 'arrow'],//箭头
                            data: darr,
                            links: larr
                        }
                    ]
                }, true)
            }else app.aconfirms.cshow("re line is fail.")

        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        // this.fRefushTable()
    },

})
