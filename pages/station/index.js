// pages/trends/trends.js
import api from '../../api/index';
var utils = require("../../utils/util.js");
// const roomId = api.roomId;
const app = getApp();

Page({
  data: {
    pageData: [],
    isloading: false,
    noData: false,
    isAuth: false,
    currentTab: '0',
    //  节目回放data 如下
    isPlayloading: false,
    playNoData: false,
    songs: [],
    name: '',
  },

  swiperTab: function (e) {
    var that = this;
    that.setData({
      currentTab: e.detail.current
    });
  },

  clickTab: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      }, () => {
        if (e.target.dataset.current == '1' && that.data.pageData.length === 0) {
          let demo = '2018-05-18%2022:47:50';
          if(this.data.isAuth !== app.globalData.isAuth)this.setData({isAuth: app.globalData.isAuth});
          that.getList(that.stationId, demo);
        }
      })
    }
  },

  testAuth() {
    var that = this;
    if (that.data.isAuth) return;
    if (app.globalData.isAuth) {
      that.setData({ isAuth: true });
    } else {
      app.allowAuth(() => {
        that.setData({ isAuth: true });
      });
    }
  },

  ToTrendsDetail: function (e) {
    let { types, songid, itemid, source, web} = e.currentTarget.dataset;
    if (types === 'song') {
      let url = utils.toPlaySong(songid);
      let newUrl = encodeURIComponent(url);
      wx.navigateTo({
        url: `../playMusic/index?url=${newUrl}`
      })
    } else if (types === 'topic' && source === 'weixin' && web) {
      let newWeb = web.replace('http://images.muzhifm.com', 'https://images.muzhiyun.cn');
      // newWeb = 'https://images.muzhiyun.cn/UniMessageFiles/WeiXinArticle/shxwcb/170306/2654438565_1.html'
      let newUrl = encodeURIComponent(newWeb);
      wx.navigateTo({
        url: `../wxDetail/index?message=${itemid}&url=${newUrl}`
      })
    } else {
      wx.navigateTo({
        url: `../trendsDetail/trendsDetail?message=${itemid}`
      })
    }
  },

  ToggleZan(e) {
    this.testAuth();
    if (!this.data.isAuth) return;
    let item = e.currentTarget.dataset.item;
    let body = {messageId: item.id};
    if (item.isFavorited) {
      api.unLikeProgram(body);
    } else {
      api.likeProgram(body);
    }
    this.data.pageData.map((ele) => {
      if(ele.id === item.id) {
        if (item.isFavorited) {
          ele.favoritedCount -= 1;
          ele.isFavorited = false;
        } else {
          ele.favoritedCount += 1;
          ele.isFavorited = true;
        }
      }
      return ele;
    })
    this.setData({ pageData: this.data.pageData });
  },

  getList(stationId, startTime) {
    this.setData({isloading: true});
    api.getStationList(stationId, startTime).then((data) => {
      let datas = data.data.Data;
      let newData = datas.map((ele, idx) => {
        let dateNum = Date.parse(new Date(ele.publishedAt));
        let nowData = new Date().getTime();
        if ((dateNum - nowData) > 2000) dateNum -= 28800000;
        ele.publishedAt = utils.timeDifference(dateNum);
        let avatar = ele.owner.avatar;
        ele.ownerAvatar = utils.withMZYHttp(avatar);
        if (ele.data && ele.data.duration) ele.duration = utils.MillisecondToDate(ele.data.duration);
        ele.ownerNickname = ele.owner.nick;
        if(ele.type === 'vote') {
          this.mapVote(ele);
        }
        if(ele.type === 'topic') {
          let images = ele.data.images.slice(0,2);
          ele.data.images = images;
        }
        return ele;
      });
      if (newData.length > 0) {
        let last = newData[newData.length - 1];
        this.sendTime = last.sendTime || '';
        // let newPageData = utils.unionBy(this.data.pageData, newData, 'id');
        let newPageData = [...this.data.pageData, ...newData];
        this.setData({ pageData: newPageData, isloading: false });
      } else {
        this.setData({ noData: true, isloading: false });
      }
    })
  },

  mapVote(ele) {
    ele.voteMsg = '投票';
    ele.canVote = true;
    if (ele.isJoined) {
      ele.voteMsg = '您已投票';
      ele.canVote = false;
    } else {
      let nowTime = Date.parse(new Date());
      let timeEnd = nowTime;
      if (ele.data.endTime) {
        timeEnd = Date.parse(new Date(ele.data.endTime));
        ele.data.overTime = utils.getLocalTime(timeEnd);
      }
      if (nowTime - timeEnd > 0) {
        ele.canVote = false;
        ele.voteMsg = '投票已过期';
      }
    }
    if (ele.data.items && ele.data.items.length > 0) {
      let sum = 0;
      ele.data.items.map((ele, idx) => {
        sum += ele.count;
      });
      ele.data.items.map((ele, idx) => {
        ele.percent = Math.round(ele.count / sum * 100);
        return ele;
      });
    }
  },

  vote(e) {
    let { msgid, canvote } = e.target.dataset;
    if(canvote) {
      let voteId = this.voteData[msgid];
      if(voteId) {
        let body = { messageId: msgid, voteid: voteId};
        api.takePartInVote(body).then(() => {
          this.data.pageData.map((ele) => {
            if (ele.id === msgid) {
              if (!ele.isJoined) {
                ele.isJoined = true;
                ele.data.items.map((res, idx) => {
                  if(res.voteItemId === voteId) {
                    res.count +=1;
                  }
                  return res;
                });
                this.mapVote(ele);
              }
            }
            return ele;
          })
          this.setData({ pageData: this.data.pageData });
        });
      } else {
        wx.showToast({
          title: '请选择一项投票',
          icon: 'none',
          duration: 1500
        })
      }
    }
  },

  radioChange(res) {
    let { msgid } = res.target.dataset;
    this.voteData[msgid] = res.detail.value;
  },

  /**
 * 生命周期函数--监听页面加载
 */
  onLoad: function (options) {
    let { channel } = options;
    this.pageIndex = 1;
    var that = this;
    this.voteData = {}; // 投票信息
    var Token = wx.getStorageSync('uniMsgToken') || app.globalData.uniMsgToken;
    let stationId = channel || app.globalData.channelId;
    this.stationId = stationId;
    if (Token) {
      // this.getList(stationId, demo);
      this.loadChannelDetail(this.stationId);
      this.getplayBackList(this.pageIndex, this.stationId);
      if (this.data.isAuth !== app.globalData.isAuth) this.setData({ isAuth: app.globalData.isAuth });
    } else {
      app.uniTokenReadyCallback = () => {
        // that.getList(stationId);
        that.loadChannelDetail(this.stationId);
        that.getplayBackList(that.pageIndex, that.stationId);
        if (that.data.isAuth !== app.globalData.isAuth) that.setData({ isAuth: app.globalData.isAuth });
      }
    }
  },

  //========================================================
  //  ================== playBack 页面    节目回放方法 ===================
    //========================================================

  /**
   * 触底加载更多
   */
  playBackReachBottom: function () {
    if (!this.data.isPlayloading && !this.data.playNoData) {
      this.getplayBackList(this.pageIndex, this.stationId)
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

  // 获取频道详情

  loadChannelDetail: function (channelid) {
    var that = this;
    api.loadChannelDetail(channelid, 1).then(res => {
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
    this.setData({ isPlayloading: true });
    api.getPlayBackList(pageIndex, channelid, 20).then((item) => {
      if (item.data.Data) {
        let data = item.data.Data;
        let newData = data.map((el, index) => {
          // el.Title = el.Title.split(' ')[0];
          el.TimeRange = utils.timeDifference(new Date(new Date(el.TimeRange).getTime() + new Date(el.TimeRange).getTimezoneOffset() * 60000))
          el.Duration = utils.sec_to_time(el.Duration / 1000);
          el.startAndEnd = el.StartTime + '-' + el.EndTime;
          return el;
        })
        if (newData.length > 0) {
          this.pageIndex += 1;
          that.setData({
            songs: [...this.data.songs, ...newData],
            isPlayloading: false
          })
        } else {
          that.setData({
            playNoData: true,
            isPlayloading: false
          })
        }

      }
    })
    //完成停止加载
    // wx.hideNavigationBarLoading()

  },
  //========================================================
  // ===================节目回放方法end ==========================
  //========================================================

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
    // if (!this.data.isloading && !this.data.noData){
    //   this.getList(this.stationId, this.sendTime);
    // }
  },

  /**
   * 动态  触底事件的处理函数
   */
  trendsReachBottom: function () {
    if (!this.data.isloading && !this.data.noData) {
      this.getList(this.stationId, this.sendTime);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      let { messageid, url, image, types, source, songid, web} = res.target.dataset;
      if (types === 'song' && songid) {
        let urll = utils.toPlaySong(songid);
        let newUrl = encodeURIComponent(urll);
        return {
          title: '动态转发',
          imageUrl: image || url,
          path: `/pages/playMusic/index?url=${newUrl}`,
          success: function (res) {
            api.shareVisit({ messageId: messageid });
            // 转发成功
          },
          fail: function (res) {
            // 转发失败
          }
        }
      }  else if (source === 'weixin' && web) {
        let newWeb = web.replace('http://images.muzhifm.com', 'https://images.muzhiyun.cn');
        let newUrl = encodeURIComponent(newWeb);
        return {
          title: '动态转发',
          imageUrl: image || url,
          path: `/pages/wxDetail/index?message=${messageid}&url=${newUrl}`,
          success: function (res) {
            api.shareVisit({ messageId: messageid });
            // 转发成功
          },
          fail: function (res) {
            // 转发失败
          }
        }
      } else {
        return {
          title: '动态转发',
          imageUrl: image || url,
          path: `/pages/trendsDetail/trendsDetail?message=${messageid}`,
          success: function (res) {
            api.shareVisit({ messageId: messageid});
            // 转发成功
          },
          fail: function (res) {
            // 转发失败
          }
        }
      }
    } else {
      return {
        title: '转发',
        path: `/pages/station/index??channel=${this.stationId}`,
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        }
      }
    }
  }
})