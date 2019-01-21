// pages/moreComment/moreComment.js

import Api from '../../api/index';
var utils = require("../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CommentId: '',
    childCommentList: []
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.CommentId)

    this.setData({
      CommentId: options.CommentId
    })

    this.getChildsComment();

  },

  getChildsComment: function () {
    Api.getChildComments(this.data.CommentId, 1, 20).then((res) => {
      console.log(res.data.Data);
      let data = res.data.Data;
      if (data) {
        let newData = data.map((el, i) => {
          el.CommentTime = utils.timeTransform(el.CommentTime);
          return el;
        })

        console.log(newData)
        this.setData({
          childCommentList: newData,
        })
      }
    })
  },

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
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})