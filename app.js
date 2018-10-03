//app.js
App({
  onLaunch: function (options) {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log('login res', res);
        this.globalData.code = res.code;
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            openIdList: ['selfOpenId'],
            lang: 'zh_CN',
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo;
              console.log('userInfo', res.userInfo);
              var data = {
                'code' : this.globalData.code,
                'nickname': res.userInfo.nickName,
                'headimgurl': res.userInfo.avatarUrl,
                'sex': res.userInfo.gender,
                'country': res.userInfo.country,
                'province': res.userInfo.province,
                'city': res.userInfo.city,
              }
              this.get(this.globalData.api.login, data).then((result) => {
                console.log('result', result);
                if(result.errcode == this.globalData.errcode.OK){
                  if(result.data.openid.length > 0){
                    this.globalData.openid = result.data.openid;
                  }else{
                    this.globalData.openid = '';
                  }
                  if(result.data.token.length > 0){
                    this.globalData.token = result.data.token;
                  }else{
                    this.globalData.token = '';
                  }
                }else{
                  wx.showToast({
                    title: result.errmsg,
                    icon: 'none',
                    duration: 1500
                  })
                }
              }).catch((err) => {
                wx.showToast({
                  title: err,
                  icon: 'none',
                  duration: 1500
                })
              })
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              // if (this.userInfoReadyCallback) {
              //   this.userInfoReadyCallback(res)
              // }
            }
          })
        }
      }
    })
  },
  onShow: function (options) {
    // Do something when show.
  },
  onHide: function () {
    // Do something when hide.
  },
  onError: function (msg) {
    console.log(msg)
  },
  onPageNotFound: function (options){
    
  },
  getUserInfo: function (e) {
    console.log('app getUserInfo', e)
    // 用户有可能点击拒绝授权
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
    }
  },
  post: function(url, data){
    var that = this;
    var promise = new Promise((resolve, reject) => {
      wx.request({
        url: that.globalData.api_url + url,
        data: data,
        method: 'POST',
        header: {
          'token': that.globalData.token,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        success: function (res) {//服务器返回数据
          if (res.data.errcode == 200) {
            resolve(res.data.data);
          } else {//返回错误提示信息
            reject(res.data.errmsg);
          }
        },
        error: function (e) {
          reject('网络出错');
        }
      })
    });
    return promise;
  },  
  get: function(url, data){
    var that = this;
    let promise = new Promise(function (resolve, reject) {
      wx.request({
        url: that.globalData.api_url + url,
        header: {
          'token': that.globalData.token,
          'content-type': 'application/json' // 默认值
        },
        data: data,
        method: 'GET',
        success: function (res) {
          if (res.data.errcode == 200) {
            resolve(res.data);
          } else {//返回错误提示信息
            reject(res.data.errmsg);
            //reject('请求出错,请稍后重试');
          }
        },
        error: function (e) {
          reject('网络出错');
        }
      })
    });
    return promise;
  },
  globalData: {
    userInfo: null,
    code: '',
    token: '',
    openid: '',
    api_url: 'http://api.tvaf.local.cn/weapp/',
    api: {
      login: 'login',
    },
    errcode: {
      OK: 200,
      FAIL: 500,
    }
  }
})