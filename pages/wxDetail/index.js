import api from '../../api/index';
Page({
  data: {
    url: ''
  },

  onLoad: function (data) {
    let { url, message } = data;
    let toUrl = decodeURIComponent(url);
    this.message = message;
    this.url = toUrl;
    url ? this.setData({ url: toUrl }) : wx.navigateBack();
  },

  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '动态转发',
      path: `/pages/wxDetail/index?message=${this.message}&url=${this.url}`,
      success: function (res) {
        api.shareVisit({ messageId: this.message });
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
});