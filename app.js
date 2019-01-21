import api from './api/index';
var utils = require("./utils/util.js");
App({
  onLaunch: function () {
    // 登录
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          this.globalData.isAuth = true;
          if (this.pageReadyCallback) {
            this.pageReadyCallback(this.globalData.isAuth);
          }
          // this.login();
        }
        //  else {
        this.login();
          // if (wx.authorize) {
          //   wx.authorize({
          //     scope: 'scope.userInfo',
          //     success(res) {
          //       that.globalData.isAuth = true;
          //       if (that.pageReadyCallback) {
          //         that.pageReadyCallback(that.globalData.isAuth);
          //       }
          //       that.login();
          //     },
          //     fail(res) {
          //       that.login();
          //     },
          //   })
          // } else {
          //   wx.showModal({
          //     title: '提示',
          //     content: '当前微信版本过低，请升级到最新微信版本后重试。'
          //   })
          // }
        // }
        if (res.authSetting['scope.userLocation']) {
          wx.getLocation({
            type: 'wgs84',
            success: function (res) {
              var latitude = res.latitude
              var longitude = res.longitude
              let body = { latitude, longitude };
              api.postLocation(body)
            }
          })
        } else {
          var that = this;
          if (wx.authorize) {
            wx.authorize({
              scope: 'scope.userLocation',
              success() {
                wx.getLocation({
                  type: 'wgs84',
                  success: function (res) {
                    var latitude = res.latitude
                    var longitude = res.longitude
                    let body = { latitude, longitude };
                    api.postLocation(body)
                  }
                })
              }
            })
          } else {
            wx.showModal({
              title: '提示',
              content: '当前微信版本过低，请升级到最新微信版本后重试。'
            })
          }
        }
      }
    })
  },
  login: function (reload=false) {
    var token = wx.getStorageSync('Token');
    var uniMsgToken = wx.getStorageSync('uniMsgToken');
    if (!token || !uniMsgToken || reload) {
      wx.login({
        success: result => {
          var code = result.code;
          var uuid = wx.getStorageSync('uuid');
          if (!uuid) {
            uuid = utils.uuid();
            wx.setStorageSync('uuid', uuid);
          }
          var appLogin = (res) =>{
            var { SDKVersion } = wx.getSystemInfoSync();
            let body = {
              Platform: "3",
              AppKey: "A33CACBAA1F3B488",
              DeviceId: uuid,
              OSVersion: SDKVersion
            };
            api.appInt(body).then((initData) => {
              let body = {
                code,
                nick: res? res.nickName : '游客',
                gender: res? res.gender: 0,
                avatarUrl: res? res.avatarUrl: '',
              }
              let options = {
                headers: { "Token": initData.data.Data.Token }
              }
              api.getUserToken(body, options).then((userData) => {
                wx.setStorageSync('Token', userData.data.Data.Token);
                wx.setStorageSync('Profile', userData.data.Data.Profile);
                this.globalData.token = userData.data.Data.Token;
                this.globalData.Profile = userData.data.Data.Profile;
                api.fly.config.headers.Token = userData.data.Data.Token;
                if (this.userTokenReadyCallback) {
                  this.userTokenReadyCallback(userData.data.Data.Token)
                }
                let userId = userData.data.Data.Profile.UserId;
                let ref = {userId,
                  nick: res ? res.nickName : '游客',
                  gender: res ? res.gender : 0,
                  avatar: res ? res.avatarUrl : '',}
                api.getUniMsgToken(ref).then((data) => {
                  let uniMsgToken = data.data.Data.token;
                  this.globalData.uniMsgToken = uniMsgToken;
                  wx.setStorageSync('uniMsgToken', uniMsgToken);
                  if (this.uniTokenReadyCallback) {
                    this.uniTokenReadyCallback(uniMsgToken)
                  }
                })
              });
            });
          }
          this.getUserInfo(appLogin);
        }
      })
    }
  },
  getUserInfo: function (cb) {
    var that = this;
    if (that.globalData.userInfo) {
      typeof cb == "function" && cb(that.globalData.userInfo);
    } else {
      wx.getUserInfo({
        success: function (res) {
          that.globalData.userInfo = res.userInfo;
          typeof cb == "function" && cb(that.globalData.userInfo);
          // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
          if (that.userInfoReadyCallback) {
            that.userInfoReadyCallback(res);
          }
        },
        fail: function () {
          typeof cb == "function" && cb();
        }
      })
    }
  },
  allowAuth: function (cb) {
    var that = this;
    wx.showModal({
      title: '需要用户信息授权',
      content: '授权用户信息之后才能进行点赞、评论等操作呢哦~',
      success: function (res) {
        if (res.confirm) {
          wx.openSetting({
            success: (res) => {
              if (res.authSetting['scope.userInfo']) {
                that.globalData.isAuth = true;
                that.login(true);
                typeof cb == "function" && cb()
              }
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })
  },
  globalData: {
    isAuth : false,
    userInfo: null,
    token:null,
    uniMsgToken:null,
    Profile:null,
    stations:{},
    channelId: '',
  }
})