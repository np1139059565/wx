// miniprogram/pages/setting.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        dbuttons:[{
            text:"checkFiles",
            event:"checkfiles"
        }],
        revpath:"",
        fs:[],
        conter:""

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.nextpath(null,app.dbpath)
    },
    nextpath(e,path){
        if(path==null){
            path=this.data.revpath.split("/").reverse().join("/")+"/"+e.target.dataset.event1Params1
        }
        if(app.file.isExist(path)&&app.file.getinfo(path).isDirectory()){
            this.data.revpath=path.split("/").reverse().join("/")
            this.data.fs=[]
            app.file.readdir(path).map(p=>this.data.fs.push({text:p}))
        }
        this.setData(this.data)
    },
    edit(fpath){
        // this.data.conter=app.file.readfile(fpath)
        // this.setData(this.data)
        const that = this
        wx.createSelectorQuery().select("#id-edit").context(function(res) {
            that.editorCtx = res.context
            that.editorCtx.setContents({
                html:app.file.readfile(fpath)
            });
        }).exec()
    },

    backpath(e){
      this.nextpath(null,this.data.revpath.substr(this.data.revpath.indexOf("/")+1).split("/").reverse().join("/"))
    },
    openmenu(e){
        const menus=["remove"]
        const path=this.data.revpath.split("/").reverse().join("/")+"/"+e.target.dataset.event1Params1
        if(app.file.getinfo(path).isDirectory()){
            menus.push("open")
        }else menus.push("edit")
        app.showActionSheet(menus,(sval)=>{
            switch (sval){
                case "open":
                    this.nextpath(e)
                    break;
                case "edit":
                    this.edit(this.data.revpath.split("/").reverse().join("/")+"/"+e.target.dataset.event1Params1)
                    break;
                case "remove":
                    app.showModal("Are you sure to delete "+path+"?",()=>{
                        app.showModal("rm is "+app.file.rmPath(path))
                        this.nextpath(null,this.data.revpath.split("/").reverse().join("/"))
                    },()=>{})
                    break;
            }
        })
    },
    checkfiles(){
        app.checkpaths()
        this.nextpath(null,this.data.revpath.split("/").reverse().join("/"))
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