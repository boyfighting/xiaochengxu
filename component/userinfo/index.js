module.exports = {
  showZanUserInfo() {
    this.setData({
      zanUserInfo: true
    });
  },

  _resultUserInfo(res) {
    this.getUserInfo(res);
  },

  clearZanUserInfo() {
    this.setData({
      zanUserInfo: false
    });
  },
};
