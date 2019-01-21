// pages/trnedsDetail/trendsDetail.js
import api from '../../api/index';
var utils = require("../../utils/util.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    comment: [],
    programData: null,
    showBottomPopup: false,
    searchinput: '',
    alreadyFollow:false,
    // roomMsg: null,
    replyMsg: null,
    isAuth: false,
    hasData: true,
    loadIngComment: false,
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

  // TogglefollowMe() {
  //   this.testAuth();
  //   if (!this.data.isAuth) return;
  //   let { ownerId } = this.data.roomMsg;
  //   if(this.mineId === ownerId) {
  //     return wx.showToast({
  //       title: '不能关注自己',
  //       icon: 'none',
  //       duration: 2000,
  //     });
  //   }
  //   if (this.data.alreadyFollow) {
  //     api.unFollowMe(this.mineId, ownerId);
  //   } else {
  //     api.followMe(this.mineId, ownerId);
  //   }
  //   this.setData({ alreadyFollow: !this.data.alreadyFollow});
  // },

  // testFollow(targetId, mineId = this.mineId) {
  //   api.followList(mineId).then((data) => {
  //     let followList = data.data.data || [];
  //     followList.map((ele, idx) => {
  //       if(ele.id === targetId){
  //         this.setData({ alreadyFollow: true});
  //       }
  //     })
  //   });
  // },

  toggleBottomPopup(iscomment = true) {
    if (iscomment) {
      this.setData({ showBottomPopup: !this.data.showBottomPopup, replyMsg: null });
    } else {
      this.setData({ showBottomPopup: !this.data.showBottomPopup });
    }
  },

  ToggleLikeMe(e) {
    this.testAuth();
    if (!this.data.isAuth) return;
    let item = e.currentTarget.dataset.item;
    let body = { messageId: item.id };
    if (item.isFavorited) {
      api.unLikeProgram(body);
    } else {
      api.likeProgram(body);
    }
    if (item.isFavorited) {
      this.data.programData.favoritedCount -= 1;
      this.data.programData.isFavorited = false;
    } else {
      this.data.programData.favoritedCount += 1;
      this.data.programData.isFavorited = true;
    }
    this.setData({ programData: this.data.programData });
  },

  sendComment(e) {
    var that = this;
    this.testAuth();
    if (!this.data.isAuth) return;
    var body = {};
    var value = e.detail.value;
    if(!value) {
      return wx.showToast({
        title: '不能为空',
        icon: 'none',
        duration: 2000,
      });
    }
    if (this.data.replyMsg && this.data.replyMsg.commentId) {
      let {commentId} = this.data.replyMsg;
      body.parentId = commentId;
    }
    body.content = value;
    body.messageId = that.message;
    api.addComment(body).then((data) => {
      that.toggleBottomPopup();
      let resData = data.data.Data;
      if (resData.parentComment) {
        let commentData = this.data.comment;
        commentData.map((ele, idx) => {
          if (ele.id === resData.parentComment.id) {
            resData.parentComment = resData.parentComment.id
            ele.childComments.unshift(resData);
          }
          return ele;
        })
        let comment = this.decorateComment(commentData);
        this.setData({ comment: comment, searchinput: ''});
      } else {
        let commentData = this.data.comment;
        commentData.unshift(resData);
        let comment = this.decorateComment(commentData);
        this.setData({ comment: comment, searchinput: ''});
      }
    })
  },

  showimage(e) {
    var curimage = e.currentTarget.dataset.src;
    if(curimage) {
      wx.previewImage({
        current: curimage, // 当前显示图片的http链接
        urls: [curimage] // 需要预览的图片http链接列表
      });
    }
  },

  zanComment(e) {
    this.testAuth();
    if (!this.data.isAuth) return;
    let { comment } = e.target.dataset;
    let { id, isLiked} = comment;
    let body = {commentId: id}
    if (isLiked) {
      api.delikeComment(body);
    } else {
      api.likeComment(body);
    }
    this.data.comment.map((ele) => {
      if (ele.id === id) {
        if (isLiked) {
          ele.likeCount -= 1;
          ele.isLiked = false;
        } else {
          ele.likeCount += 1;
          ele.isLiked = true;
        }
      }
      return ele;
    })
    this.setData({ comment: this.data.comment });
  },

  tapComment(e) {
    this.testAuth();
    if (!this.data.isAuth) return;
    let { comment } = e.target.dataset;
    // let { program, types } = this.data.roomMsg;
    var that = this;
    let { owner, id } = comment;
    let mineId = this.mineId;
    if (mineId === owner.userId) {
      wx.showActionSheet({
        itemList: ['删除评论'],
        success: function (e) {
          api.delComment(id).then(() => {
            that.getComment(true);
          });
        }
      });
    } else {
      let replyMsg = {
        commentOwnerId: owner.userId, // 评论拥有者id
        commentId: id, // 评论id
        commentOwnerName: owner.nick, // 评论拥有者名字
      }
      this.setData({replyMsg});
      this.toggleBottomPopup(false);
    }
  },

  tapReply(e) {
    let { reply } = e.target.dataset;
    var that = this;
    let { owner, id } = reply;
    let mineId = this.mineId;
    if (mineId === owner.userId) {
      this.testAuth();
      if (!this.data.isAuth) return;
      wx.showActionSheet({
        itemList: ['删除回复'],
        success: function (e) {
          api.delComment(id).then(() => {
            that.getComment(true);
          });
        }
      });
    }
  },

  vote(e) {
    let msgid = this.message;
    let { canvote } = e.target.dataset;
    if (canvote) {
      let voteId = this.voteData[msgid];
      if (voteId) {
        let body = { messageId: msgid, voteid: voteId };
        api.takePartInVote(body).then(() => {
          this.data.pageData.map((ele) => {
            if (ele.id === msgid) {
              if (!ele.isJoined) {
                ele.isJoined = true;
                ele.data.items.map((res, idx) => {
                  if (res.voteItemId === voteId) {
                    res.count += 1;
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
    let msgid = this.message;
    this.voteData[msgid] = res.detail.value;
  },

  getMessage(id) {
    api.getMessage(id).then((data) => {
      let pageData = data.data.Data;
      let dateNum = Date.parse(new Date(pageData.publishedAt));
      let nowData = new Date().getTime();
      if ((dateNum - nowData) > 2000) dateNum -= 28800000;
      pageData.publishedAt = utils.timeDifference(dateNum);
      let avatar = pageData.owner.avatar;
      pageData.ownerAvatar = utils.withMZYHttp(avatar);
      if (pageData.data && pageData.data.duration) pageData.duration = utils.MillisecondToDate(pageData.data.duration);
      pageData.ownerNickname = pageData.owner.nick;
      if (pageData.type === 'vote') {
        this.mapVote(pageData);
      }
      if (pageData.type === 'topic') {
        let images = pageData.data.images.slice(0, 2);
        pageData.data.images = images;
      }
      this.setData({ programData: pageData});
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

  decorateComment(comment) {
    comment.map((ele, idx) => {
      ele.pubTime = utils.timeDifference(Date.parse(new Date(ele.createdAt)));
      ele.owner.avatar = utils.withSZBHttp(ele.owner.avatar);
      return ele;
    })
    return comment;
  },

  getComment(reload = false) {
    let id = this.message;
    let index = this.pageIndex;
    let pageSize = 5;
    this.setData({ loadIngComment: true});
    if(reload) {
      this.pageIndex = 1;
      index = 1;
    }
    api.getComments(id, index, pageSize).then((data) => {
      let comments = data.data.Data;
      let comment = this.decorateComment(comments);
      if (comment.length < pageSize) {
        let newData = comment;
        if(!reload) {
          newData = utils.unionBy(this.data.comment, comment, 'id');
        }
        this.setData({ hasData: false, loadIngComment: false, comment: newData});
      } else {
        let newData = comment;
        this.pageIndex +=1;
        if (!reload) {
          newData = utils.unionBy(this.data.comment, comment, 'id');
        }
        this.setData({ hasData: true, comment: newData, loadIngComment: false});
      }
    })
  },

  loadMoreComment() {
    this.getComment();
  },

  onLoad: function (options) {
    let { message } = options;
    this.message = message;
    this.voteData = {}; // 投票信息
    var that = this;
    this.pageIndex = 1;
    var Token = wx.getStorageSync('uniMsgToken') || app.globalData.uniMsgToken;
    if (Token) {
      this.setData({ isAuth: app.globalData.isAuth });
      this.getMessage(message);
      this.getComment(true);
      // this.dongTaiDeatail(room, program, types, true);
      // this.comment(program, types);
      this.mineId = wx.getStorageSync('Profile').UserId || app.globalData.Profile.UserId;
    } else {
      app.uniTokenReadyCallback = () => {
        that.setData({ isAuth: app.globalData.isAuth });
        this.getMessage(message);
        this.getComment(true);
        // that.dongTaiDeatail(room, program, types, true);
        // that.comment(program, types);
        that.mineId = wx.getStorageSync('Profile').UserId || app.globalData.Profile.UserId;
      }
    }
  },

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
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '动态转发',
      path: `/pages/trendsDetail/trendsDetail?message=${this.message}`,
      success: function (res) {
        api.shareVisit({ messageId: this.message });
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})