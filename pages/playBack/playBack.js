//index.js
import Api from '../../api/index';
var utils = require("../../utils/util.js");
const app = getApp();
Page({

  data: {
    songs: [],
    scrollTop: 0,
    scrollHeight: 0,
    isloading: false,
    name: '',
    noData: false,
  },

  // 下拉刷新  加载更多

  // onPullDownRefresh: function () {
  //   wx.showNavigationBarLoading()
  //   // this.getplayBackList()
  // },
  
  // 滚动到底部加载更多

  onReachBottom: function () {
    if(!this.data.isloading && !this.data.noData){
      this.getplayBackList(this.pageIndex, this.channelid)
    }
  },

  // 点击回放列表

  clicAudiokDetail: function (e) {
    var SoundFileId = e.currentTarget.dataset.index.SoundFileId;
    var FolderId = e.currentTarget.dataset.index.FolderId;
    var RichMediaCount = e.currentTarget.dataset.index.RichMediaCount;
    var name = this.data.name;
    wx.navigateTo({
      url: `../playDetail/playDetail?SoundFileId=${SoundFileId}&FolderId=${FolderId}&RichMediaCount=${RichMediaCount}&name=${name}`,
    })
  },

  onLoad: function () {
    this.channelid = app.globalData.channelId;
    var Token = wx.getStorageSync('Token') || app.globalData.token;
    this.pageIndex = 1;
    var that = this;
    if (Token) {
      this.loadChannelDetail(this.channelid)
      this.getplayBackList(this.pageIndex, this.channelid)
    } else {
      app.userTokenReadyCallback = () => {
        that.loadChannelDetail(channelid)
        that.getplayBackList(that.pageIndex, that.channelid)
      }
    }
  },

  // 获取频道详情

  loadChannelDetail: function (channelid) {
    var that = this;
    Api.loadChannelDetail(channelid, 1).then(res => {
      wx.setNavigationBarTitle({
        title: res.data.Data.Name
      })
      that.setData({
        name: res.data.Data.Name
      })
    })
  },
  // 获取节目回放列表

  // '00BF10E9-144A-E511-B870-A35AA304D87F'   视频stationID
  getplayBackList: function (pageIndex, channelid) {
    var that = this;
    this.setData({ isloading: true });
    Api.getPlayBackList(pageIndex, channelid, 20).then((item) => {
      if (item.data.Data) {
        let data = item.data.Data;
        let newData = data.map((el, index) => {
          // el.Title = el.Title.split(' ')[0];
          el.TimeRange = utils.timeDifference(new Date(new Date(el.TimeRange).getTime() + new Date(el.TimeRange).getTimezoneOffset() * 60000))
          el.Duration = utils.sec_to_time(el.Duration / 1000);
          el.startAndEnd = el.StartTime + '-' + el.EndTime;
          return el;
        })
        if(newData.length > 0){
          this.pageIndex+=1;
          that.setData({
            songs: [...this.data.songs, ...newData],
            isloading: false
          })
        } else {
          that.setData({
            noData: true, 
            isloading: false
          })
        }
        
      }
    })
    //完成停止加载
    // wx.hideNavigationBarLoading()
    
  },
  onReady: function () {
  },

  /**
 * 用户点击右上角分享
 */

  onShareAppMessage: function (res) {
    return {
      title: '转发',
      path: '/pages/index/index',
      success: function (res) {
        
      },
      fail: function (res) {
        
      }
    }
  }
  
})



