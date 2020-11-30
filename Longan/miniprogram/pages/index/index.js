//index.js
const app = getApp()

Page({
    data: {
        vheight:wx.getSystemInfoSync().windowHeight,//获取当前窗口的高度
        scroll:{
            scrollTop:0,
        }
    },

    onLoad: function () {

    },

})
