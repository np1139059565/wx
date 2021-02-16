//index.js
const app = getApp()

Page({
    data: {
        avatarUrl: '',
        userInfo: {},
        cloudID: "",
        bushu: 0
    },

    onLoad: function () {
        this.mlogin(this.getbushu)
    },
    mlogin(callback) {
        // 获取用户信息
        wx.getSetting({
            complete: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            this.setData({
                                avatarUrl: res.userInfo.avatarUrl,
                                userInfo: res.userInfo,
                                cloudID: res.cloudID
                            })
                            if (typeof callback == "function") {
                                callback()
                            }
                        }
                    })
                }
            }
        })
    },
    getbushu() {
      wx.getWeRunData({
        success: res => {
          wx.cloud.callFunction({
            name: 'echo',
            data: {
              // info 字段在云函数 event 对象中会被自动替换为相应的敏感数据
              info: wx.cloud.CloudID(res.cloudID),
            },
          }).then(res => {
            console.log('[onGetWeRunData] 收到 echo 回包：', res)
            const bushus=res.result.info.data.stepInfoList
            console.info("bushu:"+new Date(bushus[bushus.length-1].timestamp).toJSON()+":"+bushus[bushus.length-1].step)
            this.setData({
              bushu:bushus[bushus.length-1].step,
            })

            wx.showToast({
              title: '步数获取成功',
            })
          }).catch(err => {
            console.log('[onGetWeRunData] 失败：', err)
          })
        }
      })
    },
    decode() {

    }
})
