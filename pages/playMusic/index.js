Page({
  data: {
    url: ''
  },
  onLoad: function (data) {
    let { url } = data;
    let toUrl = decodeURIComponent(url);
    url ? this.setData({ url: toUrl }) : wx.navigateBack();
  }
});