import Api from '../../api/index';
var utils = require("../../utils/util.js");

const innerAudioContext = wx.createInnerAudioContext()
const recorderManager = wx.getRecorderManager()

var recordTimeInterval;
var recordTimeInterval

var app = getApp()
Page({
  data: { 
    showBottomPopup: false,
    showdeletePopup: false,
    showreplyPopup: false,
    SoundFileId: '',
    FolderId: '',
    show: false,//暂停播放按钮切换
    playBg: '../../images/play_audio.png',
    pastProgramList: '',
    currentAudio: {},
    commentsList: [],
    isloading: false,
    richMediaList: [],
    AnchorList: [],
    // Intro: '',
    HeaderUrl: '',
    playInTime: 0,
    totalTime: 0,
    newplayInTime: '00:00',
    newtotalTime: '00:00',
    pageSize: 20,
    RichMediaCount: 0,
    CommentId: '',
    toCommentID: '',
    hidden: false,
    currcomment: '',
    replayComment: '',
    animationData: {},
    run: 0,
    name: '',
    focus: false,
    noData: false,
    isAuth: false,
    showRecord: false,
    playRecord: false,
    startTouch: 0,
    toUserId: '',
    toNick: '',
    touch_start: '',
    touch_end: '',
    recordTime: 0,
    formatedRecordTime: '00:00',
    recordImage: '../../images/record.png'
  },

  testAuth() {
    var that = this;
    if(that.data.isAuth) return;
    if (app.globalData.isAuth) {
      that.setData({ isAuth: true});
    } else {
      app.allowAuth(() => {
        that.setData({ isAuth: true });
      });
    }
  },

  // 上传图片

  selectPic: function () {
    var that = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        let path = res.tempFilePaths[0];
        let MsgType = 'FMImageElem';
        let duration = '';
        that.uploadimg(path, MsgType, duration);
      }
    })
  },

  uploadimg: function (path, MsgType, duration) {
    var that = this;
    var token = wx.getStorageSync('uniMsgToken') || app.globalData.uniMsgToken;
    wx.showLoading({
      title: '正在上传',
    })
    wx.uploadFile({
      url: 'https://unimessage3test.muzhiyun.cn/api/wechatapp/addIVComment',
      filePath: path,
      name: 'bfile',
      header: {
        token: token,
      },
      formData: {
        SoundFileId: that.data.SoundFileId,
        MsgType: MsgType,
        source: 'FM',
        duration: duration, 
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (MsgType == 'FMVoiceElem'){
            this.setData({
              showRecord: !this.data.showRecord,
            })
          }
          wx.hideLoading()
          that.getCommentsnew();
        }
      },
      fail: (res) => {
        console.log('上传失败');
      },
      complete: () => {
        console.log('complete');
      }
    });
  },


  showRecord: function () {
    this.setData({
      showRecord: !this.data.showRecord,
    })

  },

  // 上传语音

  recordStart: function (e) {
    var that = this;
    that.setData({
      startTouch: e.touches[0].clientY,
    })
    const options = {
      duration: 60000,
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'aac',
      frameSize: 50
    }
    recordTimeInterval = setInterval(function () {
      var recordTime = that.data.recordTime += 1
      that.setData({
        formatedRecordTime: utils.formatTime3(that.data.recordTime),
        recordTime: recordTime
      })
    }, 1000)
    recorderManager.start(options);
    recorderManager.onStart((res) => {
      wx.showLoading({
        title: '录音中...',
      })
    })
    // recorderManager.onError((res) => {
    //   console.log(res);
    //   wx.showToast({
    //     title: 'error',
    //     icon: 'warn',
    //     duration: 1000
    //   })
    // })
    setTimeout(function() {
      recorderManager.stop();
    }, 6000)
  },

  recordEnd: function (e) {
    var that = this;
    clearInterval(recordTimeInterval)
    recorderManager.stop();
    wx.hideLoading();
    
    recorderManager.onStop((res) => {
      wx.showToast({
        title: '录音成功',
        icon: 'success',
        duration: 1000
      })
      const { tempFilePath, duration } = res;
      let MsgType = 'FMVoiceElem';
      that.uploadimg(tempFilePath, MsgType, that.data.recordTime).then(() => {
        that.setData({
          recordTime: 0,
          formatedRecordTime: utils.formatTime3(0)
        })
      });
     
    });
  },

  recordUpEnd: function (e) {
    clearInterval(recordTimeInterval)
    recorderManager.stop();
    if (e.touches[0].clientY - this.data.startTouch < -10){
      this.setData({
        showRecord: !this.data.showRecord,
      })
    }
  },

  palyRecord: function (e) {
    var that = this;
    that.setData({
      playRecord: !that.data.playRecord,
    })
    if (that.data.playRecord){
      wx.playVoice({
        filePath: e.currentTarget.dataset.record.Content,
        success: function () {
          that.setData({
            recordImage: '../../images/message_voice.gif',
          })
        }
      })
    }else{
      that.setData({
        recordImage: '../../images/record.png'
      })
      wx.stopVoice()
  }
  },
  
  // 评论弹窗
  toggleBottomPopup() {
    this.setData({
      showBottomPopup: !this.data.showBottomPopup
    }); 
  },

  toggledeletePopup() {
    this.setData({
      showdeletePopup: !this.data.showdeletePopup
    });
  },

  togglereplyPopup() {
    this.setData({
      showreplyPopup: !this.data.showreplyPopup,
      hidden: false
    });
  },

  showPassProgram: function () {
    this.toggleBottomPopup();
  },

  // 评论

  bindFormSubmit: function (e) {
    var that = this;
    that.testAuth();
    if(!that.data.isAuth) return;
    let comments = e.detail.value;
    if (e.detail.value == '') {
      wx.showToast({
        title: '评论内容不能为空',
        icon: 'none',
        duration: 2000
      })
    } else {
        let body = {
          "Content": comments,
          "SoundFileId": that.data.SoundFileId,
          "MsgType": 'FMTextElem',
          "source": 'FM',
          "toUserId": '',
          "toNick": '',
        };
        Api.addSoundfileComment(body).then(res => { 
          if(res){
            that.getCommentsnew();
            that.setData({
              currcomment: ''
            })
          }
        })
    }
  },

  // 滑动进度条

  slider2change: function (e) {
    wx.seekBackgroundAudio({
      position: e.detail.value,
    })
    this.setData({
      playInTime: e.detail.value
    })
  },

  // 富媒体播放

  richMediaPlay: function (res) {
    var that = this;
    const playIn = [];
    var newData = that.data.HighBitRateFile.map((el, index) => {
      var animation = wx.createAnimation({
        duration: el.TimeOffset,
        timingFunction: "ease",
        delay: 0
      })
      this.animation = animation;
      animation.scale(1.4, 1.4).step();
      if (res * 10000 >= el.TimeOffset) {
        playIn.push(el)
      }
      el.RichmediaTitle = el.RichmediaTitle.split('.')[0];
      el.Animation = this.animation.export()
      return el;
    })
    const currentPlay = playIn[playIn.length - 1];
    if (currentPlay) {
      const { RichmediaText, RichmediaTitle, HighBitRateFile, Animation } = currentPlay;
      const newCurrentPlay = {
        name: RichmediaTitle,
        text: RichmediaText,
        image: HighBitRateFile,
        animation: Animation
      }
      that.setData({
        richMediaList: newCurrentPlay,
      })
    }
  }, 

  // 播放暂停
  

  audioPlay: function () {
    var that = this;
    if(!that.data.show){
      wx.playBackgroundAudio({
        dataUrl: that.data.currentAudio.HighBitRateFileUrl,
        title: that.data.currentAudio.Title,
        success: function () {
          that.setData({
            show: false,
            playBg: '../../images/loading_video.png'
          })
        },
        fail: function () {
        },
        complete: function () {
          that.setData({
            show: true,
            playBg: '../../images/pause_vedio.png'
          })
        }
      })
    }else {
      wx.pauseBackgroundAudio();
    }
    wx.onBackgroundAudioPlay(()=>{
      // that.richMediaPlay()
      that.setData({
        show: true,
        playBg: '../../images/pause_vedio.png'
      })
    })
    wx.onBackgroundAudioPause(() => {
      that.setData({
        show: false,
        playBg: '../../images/play_audio.png'
      })
    })
    var timer = setInterval(() => {
      wx.getBackgroundAudioPlayerState({
        success: function (res) {
          if (res.currentPosition){
            var newplayInTime = utils.sec_to_time(Math.floor(res.currentPosition))
            var totalTime = res.duration;
            that.setData({
              newplayInTime: newplayInTime,
              totalTime: totalTime,
            })
          } else {
            that.setData({
              isloading: true,
            })
          }
          that.richMediaPlay(res.currentPosition)
        }
      })
    }, 1000);
  },

  onReady: function () {
    this.videoContext = wx.createVideoContext('videoCon');
  },

  onLoad: function (options) {
    this.setData({
      SoundFileId: options.SoundFileId,
      FolderId: options.FolderId,
      name: options.name,
      isAuth: app.globalData.isAuth
      // RichMediaCount: options.RichMediaCount
    })
    wx.setNavigationBarTitle({
      title: options.name
    })
    this.pageSize = 0;
    this.getProgramDetail();
    this.getCommentsnew();
    this.getPassProgramList(this.pageSize);
    this.getProgramRichMedias();
    this.getFolderDetail();

  },

  // 点击回放列表

  tapPastProgram: function (e) {
    var that = this;
    this.showPassProgram();
    that.setData({
      playInTime: 0,
      SoundFileId: e.currentTarget.dataset.index.SoundFileId,
    });
    wx.playBackgroundAudio({
      dataUrl: e.currentTarget.dataset.index.HighBitRateFileUrl,
      title: e.currentTarget.dataset.index.Title,
      success: function () {
        that.setData({
          show: false,
          playBg: '../../images/loading_video.png'
        })
      },
      fail: function () {
      },
      complete: function () {
        that.setData({
          show: true,
          playBg: '../../images/pause_vedio.png'
        })
      }
    })
    var timer = setInterval(() => {
      wx.getBackgroundAudioPlayerState({
        success: function (res) {
          if (res.currentPosition) {
            var newplayInTime = utils.sec_to_time(Math.floor(res.currentPosition))
            var totalTime = res.duration;
            that.setData({
              newplayInTime: newplayInTime,
              totalTime: totalTime,
            })
          } else {
            that.setData({
              isloading: true,
            })
          }
          that.richMediaPlay(res.currentPosition)
        }
      })
    }, 1000);
    this.getProgramDetail();
    this.getCommentsnew();
  },

  // 获取栏目详情

  getFolderDetail: function () {
    var that = this;
    Api.getFolderDetail(this.data.FolderId).then(res => {
      if(res){
        that.setData({
          AnchorList: res.data.Data.Folder.AnchorList,
          Intro: res.data.Data.Folder.Intro,
          HeaderUrl: res.data.Data.Folder.HeaderUrl,
        })
      }
    })
  },

  // 获取节目详情

  getProgramDetail: function () {
    var that = this;
    Api.getSoundFileDetail(this.data.SoundFileId).then(res => {
      var totalTime = utils.sec_to_time(Math.floor(res.data.Data.Duration / 1000));
      that.setData({
        currentAudio: res.data.Data,
        newtotalTime: totalTime,
      })
    })
  },

  // 获取评论列表

  getCommentsnew: function () {
    var that = this;
    Api.getSoundFileComment(that.data.SoundFileId, 1, 20).then(res => {
      let data = res.data.Data;
      if (data) {
        let newData = data.map((el, i) => {
          el.CommentTime = utils.timeTransform(el.CommentTime);
          return el;
        })
        that.setData({
          commentsList: newData,
        })
      }
      
    })
  },

  // 获取往期节目列表

  getPassProgramList: function (pageSize) {
    var that = this;
    that.setData({
      isloading: true
    })
    var Token = wx.getStorageSync('Token') || [];
    Api.getPassProgramList(this.data.FolderId, 1, 20).then((item) => {
      let data = item.data.Data.List;
      let newData = data.filter((el, index) => {
        el.Duration = utils.sec_to_time(el.Duration / 1000) ;
        return el.Duration;
      })
      if(newData.length > 0){
        this.pageSize += 10;
        that.setData({
          pastProgramList: [...newData, ...that.data.pastProgramList],
          isloading: false
        })
      } else {
        that.setData({
          noData: true,
          isloading: false
        })
      }
    })
  },

  // 获取节目富媒体

  getProgramRichMedias: function () {
    var that = this;
    Api.getRichMedia('ebcad955-fd57-4b9a-af09-b8aa5151638b').then(res => {
      that.setData({
        HighBitRateFile: res.data.Data.List,
      })
    })
  },

  replyComment: function () {
    this.setData({
      hidden: !this.data.hidden,
      focus: true
    })
  },

  bindFormReply: function (e) {
    var that = this;
    that.testAuth();
    if (!that.data.isAuth) return;
    let comments = e.detail.value;
    if (e.detail.value == '') {
      return ;
    } else {
      let body = {
        "Content": comments,
        "SoundFileId": that.data.SoundFileId,
        "ParentId": this.data.toCommentID,
        'MsgType': 'FMTextElem',
        'source': 'FM',
        'toNick': this.data.toNick,
        'toUserId': this.data.toUserId,
      };
      Api.addSoundfileComment(body).then(res => {
        if (res.statusCode == 200) {
          this.setData({
            hidden: !this.data.hidden,
            replayComment: ''
          })
          that.togglereplyPopup();
          that.getCommentsnew();
        }
      })
    }
  },

  // 删除或者回复评论

  deleteReplayComment: function (e) {
    var Profile = wx.getStorageSync('Profile');
    let presentUserID = Profile.UserId;
    let item = e.currentTarget.dataset.user;
    if (!item.ParentId) {
      this.setData({
        toNick: '',
        toUserId: '',
        toCommentID: item.CommentId,
        CommentId: item.CommentId,
      })
    } else {
      this.setData({
        toNick: item.nick,
        toUserId: item.userId,
        toCommentID: item.ParentId,
        CommentId: item.CommentId,
      })
    }
    if (item.userId == presentUserID) {
      this.toggledeletePopup();
    } else {
      this.togglereplyPopup();
    }
  },

  deleteComment: function () {
    var that = this;
    that.testAuth();
    if (!that.data.isAuth) return;
    let body = {
      "CommentId": this.data.CommentId
    };
    Api.deleteSoundfileComment(body).then(res => {
      if (res) {
        this.toggledeletePopup();
        that.getCommentsnew();
      }
    })
  },

  // 取消删除

  cancelDelete: function () {
    this.toggledeletePopup();
  },

 //取消回复

  cancelReply: function () {
    this.togglereplyPopup();
  },

  //添加节目赞和取消赞

  addSoundfileLike: function (e) {
    var that = this;
    that.testAuth();
    if (!that.data.isAuth) return;
    let body = {
      SoundFileId: this.data.SoundFileId,
    }
    Api.addSoundfileLike(body).then(res => {
      if (res) {
        that.getProgramDetail();
      }
    })
  },

  // 取消节目赞

  cancelSoundfileLike: function () {
    var that = this;
    that.testAuth();
    if (!that.data.isAuth) return;
    let body = {
      SoundFileId: this.data.SoundFileId,
    }
    Api.cancelSoundfileLike(body).then(res => {
      
      if(res){
        that.getProgramDetail();
      }
    }) 
  },

  //添加或取消评论赞

  toggleCommentLike: function (e) {
    var that = this;
    that.testAuth();
    if (!that.data.isAuth) return;
    let item = e.currentTarget.dataset.item;
    let body = {
      CommentId: item.CommentId,
    }
    if (!item.isLiked) {
      Api.addCommentLike(body).then(res => {
      })
    } else {
      Api.cancelCommentLike(body).then(res => {
      })
    }
    let newData = this.data.commentsList.map((ele) => {
      if (ele.CommentId == item.CommentId) {
        if (ele.isLiked) {
          ele.LikeCount -=1;
          ele.isLiked = false;
        } else {
          ele.LikeCount += 1;
          ele.isLiked = true;
        }
      }
      return ele;
    })
    this.setData({
      commentsList: newData,
    })
  },

  // 更多评论
  moreComment: function (e) {
    var CommentId = e.currentTarget.dataset.comment.CommentId;
    var name = this.data.name;
    wx.navigateTo({
      url: `../moreComment/moreComment?CommentId=${CommentId}`,
    })
  },

  // 加载更多

  onReachBottom: function () {
    // if (!this.data.isloading && !this.data.noData) {
    //   this.getPassProgramList(this.pageSize)
    // }
  },
  
  /**
   * 用户点击右上角分享
   */

  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      let { SoundFileId , FolderId } = this.data.currentAudio;
      return {
        title: '转发',
        path: `/pages/playDetail/playDetail?SoundFileId=${SoundFileId}&FolderId=${FolderId}`,
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