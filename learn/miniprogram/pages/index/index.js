//index.js
const app = getApp()

Page({
    data: {
        //key不要带“-”
        dbuttons: [{
            text: "setts",
            event: "opensetts"
        }],
        dswipers: [
            // {
            //     viewtype: "select",
            //     inf: {}
            // }
        ]
    },
    onLoad: function () {
        // app.runcallbacks(function initFZK(app1){
        //     app1.fzk=require("fzk.js")
        //     app1.fzk.init(app.mlog,app)
        // },true)

        this.nextpage()
    },
    nextpage(){
        const inf=app.fzk.nextInfo()
        this.data.dswipers.push({
            viewtype:this.getvtype(inf),
            inf:inf
        })
    },
    getvtype(inf){

    },
    opensetts() {
        wx.navigateTo({
            url: "/pages/setts/setts",
        })
    }

})
