const app = getApp();
import api from '../../api/index';
const { Tab, extend, UserInfo } = require('../../component/index.js');

Page(extend({}, Tab, UserInfo, {
  data: {
    tab1: {
      list: [{
        id: 'recommet',
        title: '推荐台'
      }, {
        id: 'location',
        title: '本地台'
      }, {
        id: 'country',
        title: '国家台'
      }, {
        id: 'province',
        title: '省市台'
      }],
      selectedId: 'recommet',
      relative: false,
    },
    stationList: [],
    show: 'a',
  },
  handleZanTabChange(e) {
    var componentId = e.componentId;
    var selectedId = e.selectedId;
    var isProvince = false;
    if (selectedId === 'province') isProvince = true;
    this.setData({
      [`${componentId}.selectedId`]: selectedId,
      [`${componentId}.relative`]: isProvince
    },() => {
      this.loadApi(selectedId);
    });
  },

  getUserInfo(res) {
    if (res.detail.errMsg === "getUserInfo:ok") {
      app.globalData.isAuth = true;
      app.login(true);
    }
  },

  onLoad: function (options) {
    var Token = wx.getStorageSync('Token') || app.globalData.token;
    var that = this;
    if (Token) {
      this.loadApi('recommet');
    } else {
      app.userTokenReadyCallback = () => {
        this.loadApi('recommet');
      }
    }
  },

  onReady: function () {
    if (!app.globalData.isAuth) {
      this.showZanUserInfo();
      app.pageReadyCallback = (isAuth) => {
        if (isAuth) this.clearZanUserInfo();
      }
    } else {
      this.clearZanUserInfo();
    }
  },

  loadApi: function (curTab) {
    switch (curTab) {
      case 'recommet':
        if (app.globalData.stations.recommet && app.globalData.stations.recommet.length > 0) {
          this.setData({ stationList: app.globalData.stations.recommet, show: 'b' });
        } else {
          api.getRecommendStationList().then((item) => {
            let list = item.data.Data.List || [];
            this.setData({ stationList: list, show: 'b'});
            app.globalData.stations.recommet = list;
          })
        }
      break;
      case 'location':
        if (app.globalData.stations.location && app.globalData.stations.location.length > 0) {
          this.setData({ stationList: app.globalData.stations.location, show: 'b'});
        } else {
          api.getLocalStationsList().then((item) => {
            let list = item.data.Data.List || [];
            this.setData({ stationList: list, show: 'b'});
            app.globalData.stations.location = list;
          })
        }
        break;
      case 'country':
        if (app.globalData.stations.country && app.globalData.stations.country.length > 0) {
          this.setData({ stationList: app.globalData.stations.country, show: 'a'});
        } else {
          api.getCountryList().then((item) => {
            let list = item.data.Data.List || [];
            this.setData({ stationList: list, show: 'a'});
            app.globalData.stations.country = list;
          })
        }
        break;
      case 'province':
        if (app.globalData.stations.provinces && app.globalData.stations.provinces.length > 0) {
          this.setData({ stationList: app.globalData.stations.provinces, show: 'c'});
        } else {
          api.getProvinces().then((item) => {
            let list = item.data.Data.List || [];
            this.setData({ stationList: list, show: 'c'});
            app.globalData.stations.provinces = list;
          })
        }
        break;
    }
  },

  checkProvince: function (e) {
    let id = e.target.dataset.id;
    let name = e.target.dataset.name;
    let isCity = false;
    if(name === '北京' || name === '上海' || name === '天津' || name === '重庆') {
      isCity = true;
    }
    api.getProvinceStationsList(id).then((item) => {
      let list = item.data.Data.List || [];
      this.setData({ stationList: list, show: isCity ? 'b' : 'a'});
    })
  },

  toStation: function (e) {
    let id = e.currentTarget.dataset.id;
    app.globalData.channelId = id;
    wx.navigateTo({
      url: `../station/index?channel=${id}`,
    })
  },

  onShow: function () {

  },
  onHide: function () {

  },
  onUnload: function () {

  },
  onPullDownRefresh: function () {

  },
  onReachBottom: function () {

  },
  onShareAppMessage: function () {
    return {
      title: '分享融媒云播',
      path: 'pages/stations/station',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
}))