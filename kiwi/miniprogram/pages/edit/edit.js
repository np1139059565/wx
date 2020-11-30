// miniprogram/pages/edit/edit.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isAdd:true,
        keys: [],
        headInfos: [],
        info: {},
        nodes: [{//key默认放在第一位
            key: "k1",
            isAllowDel: true,
            isEdit: true,
            isUF: true,
            value: 111,
            vtype: "number"// number,string,image,voice
        }],
        UF: {
            // text: "↑",
            tapEvent: "fSelectFile"
        },
        delNodeEvent: "fDelNode",
        inputEvent: "fInputChange",
        savenode: {
            text: "save",
            saveEvent: "saveClick",
            style: ""
        },
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //is add new
        this.data.isAdd=(options.isAdd?true:false)
        this.setData(this.data)
        this.reViewBySkey(options.skey)
    },
    reViewBySkey(skey) {
        this.data.nodes = []
        this.setData(this.data)
        app.adatabase.dQuery({
            where: {_id: app.setts.subid},
            field: {heads: true, infos: true, keys: true}
        }, (code, res) => {
            if(code){
                this.data.keys = res[0].keys
                const skcode = skey.split("").map(_ => _.charCodeAt()).join("")
                if (res[0].infos[skcode] != null) {
                    this.data.info = res[0].infos[skcode]
                }
                // head
                this.data.headInfos = res[0].heads
                //parse node
                for (var hi in this.data.headInfos) {
                    const nodek = this.data.headInfos[hi].text
                    this.infoToNode(this.data.headInfos[hi], this.data.info[nodek])
                }
                // check is re color
                this.checkNodeReColor()
            }else app.aconfirms.cshow("review is fail.")
        })
    },
    infoToNode(headInfo, nodev) {
        const nodek = headInfo.text
        const vtype = headInfo.vtype
        const node = {
            key: nodek,
            text: nodev,
            vtype: vtype,
            isEdit: headInfo.isED != null ? headInfo.isED : true,//是否允许编辑 def:true
            isAllowDel: nodek == app.setts.key ? false : headInfo.isDE != null ? headInfo.isDE : true,//是否允许删除 def:true
            tapEvent: ""
        }
        //是否允许上传文件 def:false
        if (headInfo.isUF != null) {
            node.tapEvent = this.data.UF.tapEvent
        }
        //default text
        if (node.text == null) {
            node.text = (vtype == "number" ? 0 : "")
        }
        //image is show
        if (node.vtype == "image") {
            node.path = app.afile.fgetFtpath(node.text)
            if (node.path == null) {
                node.path = "/images/inull.jpg"
            }
        }
        // voice
        if (node.vtype == "voice") {
            node.path = "/images/vnull.jpg"
            node.tapEvent = "downVoice"
            if ([null, ""].indexOf(node.text) < 0) {
                node.path = "/images/voice.jpg"
                node.tapEvent = "playVoice"
            }
        }
        //add to nodes(key to first)
        if (nodek == app.setts.key) {
            this.data.nodes.splice(0, 0, node)
        } else {
            this.data.nodes.push(node)
        }
    },
    downVoice(e) {
        // check is null skey
        if(this.data.keys.indexOf(this.data.info[app.setts.key])>=0){
            const trIndex = e.target.dataset.event1Params1
            const playk = this.data.nodes[trIndex].key
            //check is null key
            if(["",null].indexOf(this.data.info[playk.split(app.avoice.VC)[0]])<0){
                app.aconfirms.cshow("down voice by network?", () => {
                    app.avoice.fdownTTSToLY(this.data.info, playk, (code) => {
                        if (code) {
                            this.reViewBySkey(this.data.info[app.setts.key])
                        } else {
                            app.aconfirms.cshow("down voice is fail")
                        }
                    })
                }, () => {
                })
            }else{
                app.aconfirms.cshow("key is null.")
            }
        }else app.aconfirms.cshow("skey is null.")
    },
    playVoice(e) {
        const trIndex = e.target.dataset.event1Params1
        const nodek = this.data.nodes[trIndex].key
        app.avoice.fplayInfo(this.data.info, nodek)
    },
    fDelNode(e) {
        const trIndex = e.target.dataset.event1Params1
        const nodek = this.data.nodes[trIndex].key
        if(this.data.info[nodek]!=null){
            app.aconfirms.cshow("del node key:" + nodek + "?", () => {
                const skey = this.data.info[app.setts.key]
                if (this.data.keys.indexOf(skey) >= 0) {
                    //update yun data
                    const rfback = (code) => {
                        if (code) {
                            const skcode = skey.split("").map(_ => _.charCodeAt()).join("")
                            this.removeInfo({
                                infos: {[skcode]: {[nodek]: 1}}
                            }, (code) => {
                                if (code) {
                                    this.reViewBySkey(skey)

                                } else app.aconfirms.cshow("del is fail")
                            })
                        } else app.aconfirms.cshow("del file is fail")
                    }
                    //del file
                    const nodev = this.data.info[nodek]
                    if (nodev != null && (nodek.endsWith("voice") || nodek.endsWith("image"))) {
                        app.afile.fremoveLYFile(nodev, rfback)
                    } else rfback(true)
                } else {
                    //local del
                    this.data.nodes.splice(trIndex, 1)
                    this.setData(this.data)
                    this.checkNodeReColor()
                }
            }, () => {
            })
        }
    },
    fInputChange(e) {
        const nodeI = e.target.dataset.event1Params1
        this.data.nodes[nodeI].text = e.detail.value.trim()
        if (this.data.nodes[nodeI].vtype == "number") {
            // number def
            var defaultv = ""
            if (this.data.info[this.data.nodes[nodeI].key] != null) {
                defaultv = this.data.info[this.data.nodes[nodeI].key].text
            }
            const pv = parseFloat(e.detail.value)
            this.data.nodes[nodeI].text = ((pv >= 0 || pv < 0) ? pv : defaultv)
        }
        this.setData(this.data)
        this.checkNodeReColor()
    },
    checkNodeReColor() {
        this.data.nodes.map((n, i) => {
            const defv = this.data.info[n.key]
            //re color
            n.kstyle = (n.text != defv ? "color:red" : "")
        })
        this.setData(this.data)
    },
    saveClick(e) {
        this.saveRe(false,(code)=>{
            if(code&&this.data.isAdd){
                app.aconfirms.cshow("loop?",()=>{
                    wx.navigateTo({
                        url: "/pages/edit/edit?isAdd=true&skey=",
                    })
                },()=>{})
            }
        })
    },
    saveRe(isSilent, callback) {
        const skey = this.data.info[app.setts.key]
        var newskey = null
        var msg = ""
        var isStop = false

        const reNodes = this.data.nodes.filter((n, i) => {
            const isRe = this.data.info[n.key] != n.text
            //switch is stop
            switch (n.key) {
                case "":
                    //检查是否存在空的nodek
                    msg = "node key is null."
                    isStop = true
                    break;
                case app.setts.key:
                    newskey = n.text
                    if (newskey == "") {
                        //check skey is null
                        msg = "skey is null."
                        isStop = true
                    } else if (this.data.keys.indexOf(skey) < 0 && this.data.keys.indexOf(newskey) >= 0) {
                        // new skey is repeat
                        msg = "skey is repeat!"
                        isStop = true
                    } else if (n.text.trim().length > 0 && skey != n.text) {
                        //检查是否修改skey
                        if (isSilent) {
                            //只能在界面修改skey
                            msg = "silent is not re skey!"
                            isStop = true
                        }
                    }
                    break;
                default:
                    //re nodek
                    this.data.info[n.key] = n.text
            }

            return (isStop == false && isRe)
        })

        //is stop
        if (isStop) {
            if (isSilent) {
                app.alog.lerror(null, msg)
            } else {
                app.aconfirms.cshow(msg)
            }
            if (typeof callback == "function") {
                callback(false)
            }
        } else if (reNodes.length == 0) {
            //no re
            if (typeof callback == "function") {
                callback(true)
            }
        } else {
            if (isSilent) {
                //re info
                this.reInfo(isSilent, null, callback)
            } else {
                const skeyi = this.data.keys.indexOf(skey)
                if (newskey != null && skeyi >= 0) {
                    //只能在界面修改skey
                    app.aconfirms.cshow("re " + skey + "to " + newskey + "?", () => {
                        const skcode = skey.split("").map(_ => _.charCodeAt()).join("")
                        //del old info
                        this.removeInfo({
                            infos: {[skcode]: 1},
                            counts: {[skcode]: 1}
                        }, (code) => {
                            if (code) {
                                this.data.keys.splice(skeyi, 1, newskey)//re old skey
                                this.data.info[app.setts.key] = newskey
                                this.setData(this.data)
                                //add new info
                                this.reInfo(isSilent, this.data.keys, callback)
                            }
                        })
                    }, () => {
                        if (typeof callback == "function") {
                            callback(false)
                        }
                    })
                } else {
                    var cmsg = ("re " + reNodes.map(n => n.key).join(","))
                    if (newskey != null) {
                        //add new skey
                        this.data.keys.push(newskey)
                        cmsg = ("add new skey:" + newskey)
                        this.data.info[app.setts.key]=newskey
                        this.setData(this.data)
                    }
                    app.aconfirms.cshow(cmsg + "?", () => {
                        this.reInfo(isSilent, newskey != null ? this.data.keys : null, callback)
                    }, () => {
                        //remove new skey
                        if (newskey != null) {
                            // new skey
                            this.data.keys.splice(this.data.keys.indexOf(newskey),1)
                            this.data.info={}
                            this.setData(this.data)
                            this.checkNodeReColor()
                        }
                        if (typeof callback == "function") {
                            callback(false)
                        }
                    })
                }
            }
        }
    },
    reInfo(isSilent, keys, callback) {
        const info = this.data.info
        const skey = info[app.setts.key]
        const skcode = skey.split("").map(_ => _.charCodeAt()).join("")
        const updateGeo = {
            infos: {[skcode]: info},
        }
        if (keys != null) {
            updateGeo.keys = keys
        }
        app.adatabase.dupdate(
            {where: {_id: app.setts.subid}},
            updateGeo,
            (code, res) => {
                if (code) {
                    app.alog.linfo(res)
                } else {
                    if (isSilent) {
                        app.alog.linfo("save is fail")
                    } else {
                        app.aconfirms.cshow("save is fail")
                    }
                }
                this.reViewBySkey(skey)
                if (typeof callback == "function") {
                    callback(code)
                }
            }
        )
    },
    removeInfo(removeGeo, callback) {
        app.adatabase.dkiwiRemove(app.setts.subid, removeGeo, (code) => {
            if (code) {
                callback(code)
            } else app.aconfirms.cshow("del node is fail:" + skey)
        })
    },
    fSelectFile(e) {
        // check key is not null
        if (this.data.keys.indexOf(this.data.info[app.setts.key])>=0) {
            const nodeI = e.target.dataset.event1Params1
            if (this.data.nodes[nodeI].key == "image") {
                //select image
                wx.chooseImage({
                    count: 1,//可选图片个数
                    sizeType: ['compressed'],//图片处理方式:压缩
                    sourceType: ['album', 'camera'],//选择图片方式:相册,相机
                    success: (res) => {
                        // up image
                        this.uplFile(res.tempFiles[0], nodeI)
                    },
                    fail: e1 => {
                        app.alog.lerror(e1, "select image is fail.")
                    }
                })
            } else {
                //select file
                wx.chooseMessageFile({
                    count: 1,
                    type: 'all',
                    success: (res) => {
                        // tempFilePath可以作为img标签的src属性显示图片
                        this.uplFile(res.tempFiles[0].path, nodeI, res.tempFiles[0].name)
                    },
                    fail: e1 => {
                        app.alog.lerror(e1, "select file is fail.")
                    }
                })
            }
        } else app.aconfirms.cshow("skey is null.")
    },
    uplFile(fileInfo, nodei, name = "file1") {
        var nodek = this.data.nodes[nodei].key
        //refush vtype by nodek
        const vtype = nodek != "image" ? app.avoice.VC : nodek
        const dstpath = app.setts.subid + "/" + vtype + "/" + this.data.info[app.setts.key] + "/" + nodek
        app.aconfirms.cshow("up " + name + ":" + (fileInfo.size / 1024).toFixed(2) + "KB to " + dstpath.split("/").reverse().join("/") + "?", () => {
            // this.data.nodes[nodei].vtype=vtype
            app.afile.fsaveTmpFileToLY(fileInfo.path, dstpath, (code, rpath) => {
                if (code) {
                    this.data.nodes[nodei].text = rpath
                    this.data.nodes[nodei].path = app.afile.fgetFtpath(rpath)
                    if (this.data.nodes[nodei].path == null) {
                        this.data.nodes[nodei].path = "/images/inull.jpg"
                    }
                    this.setData(this.data)
                    this.checkNodeReColor()
                    this.saveRe(true, (code) => {
                        if (!code) {
                            app.aconfirms.cshow("up file is fail.")
                        }
                    })
                } else app.aconfirms.cshow("up file is fail.")
            })

        }, () => {
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