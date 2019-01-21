import fly from './config'
const apiHost2 = "https://www.mzliaoba.com";
const apiHost3 = 'https://fmwb.muzhiyun.cn'; // 歌曲播放
const apiHost4 = "https://unimessage3test.muzhiyun.cn";
const pathTypes = { topic: 'topics', activity: 'activities', program: 'programs', vote: 'votings' };
const commentTypes = { topic: 'topicComments', activity: 'activityComments', program: 'programComments', vote: 'voteComments' };
const replyTypes = { topic: 'topicCommentReplies', activity: 'activityCommentReplies', program: 'programCommentReplies', vote: 'voteCommentReplies' };
const roomId = 208;


let getUnMsgOption = function () {
  const app = getApp();
  let options = { baseURL: apiHost4};
  var token = wx.getStorageSync('uniMsgToken') || app.globalData.uniMsgToken;
  options.headers = { Token: token }
  return options;
}

let appInt = function(body) {
  return fly.post("/api/app/init", body)
}

let getUserToken = function(body, options) {
  return fly.post("/api/user/applet_login", body, options)
}

let loadChannelDetail = function (channelid, channelType) {
  return fly.get(`/api/channel/Detail?channelid=${channelid}&channelType=${channelType}`)
}

let postLocation = function (body) { // {longitude ,latitude}经度纬度
  return fly.post("/api/app/location_update", body)
}

let getRecommendStationList  = function () {
  return fly.get('/api/Station/GetRecommendStationList')
}

let getLocalStationsList = function () {
  return fly.get('/api/station/GetLocalStationsNew')
}

let getProvinces = function () {
  return fly.get('/api/Organization/GetProvinces')
}

let getProvinceStationsList = function (organizationId) {
  return fly.get(`/api/organization/getprovincestations?organizationId=${organizationId}`)
}

let getCountryList = function (type=0) {
  return fly.get(`/api/station/GetListByType?Type=${type}`)
}

let getPlayBackList = function (PageIndex, StationId, PageSize) {
  return fly.get(`/api/soundfile/PlayBackSoundFilesByStationId?StationId=${StationId}&PageIndex=${PageIndex}&PageSize=${PageSize}`)
}

let getFolderDetail = function (FolderId) {
  return fly.get(`/api/folder/detail?FolderId=${FolderId}`)
}

let getSoundFileDetail = function (SoundFileId) {
  return fly.get(`/api/soundfile/detail?SoundFileId=${SoundFileId}`)
}

let getRichMedia = function (soundFileId) {
  return fly.get(`/api/soundfile/GetReichMedias?soundFileId=${soundFileId}`)
}

let getSoundFileComment = function (SoundFileId, pageindex = 1 , pagesize = 20) {
  let options = getUnMsgOption();
  return fly.get(`/api/wechatapp/getComments?SoundFileId=${SoundFileId}&pageindex=${pageindex}&pagesize=${pagesize}`, null, options)
}

let getChildComments = function (CommentId, pageindex = 1, pagesize = 20) {
  let options = getUnMsgOption();
  return fly.get(`/api/wechatapp/getChildComments?CommentId=${CommentId}&pageindex=${pageindex}&pagesize=${pagesize}`, null, options)
}

let getPassProgramList = function (FolderId, PageIndex = 1, PageSize = 20) {
  return fly.get(`/api/folder/soundfiles?PageIndex=${PageIndex}&FolderId=${FolderId}&PageSize=${PageSize}`)
}
let addSoundfileComment = function (body) {
  let options = getUnMsgOption();
  return fly.post("/api/wechatapp/addComment", body, options)
}

let addSoundfilePicComment = function (body) {
  let options = getUnMsgOption();
  return fly.post("/api/wechatapp/addIVComment", body, options)
}

let deleteSoundfileComment = function (body) {
  let options = getUnMsgOption();
  return fly.post("/api/wechatapp/delComment", body, options)
}

let addCommentLike = function (body) {
  let options = getUnMsgOption();
  return fly.post("/api/wechatapp/like", body, options)
}

let cancelCommentLike = function (body) {
  let options = getUnMsgOption();
  return fly.post("/api/wechatapp/unlike", body, options)
}

let addSoundfileLike = function (body) {
  return fly.post("/api/soundfile/add_like", body)
}

let cancelSoundfileLike = function (body) {
  return fly.post("/api/soundfile/cancel_like", body)
}
//  =================动态api=========================
let getUniMsgToken = function (body) {
  return fly.post("/api/user/auth", body, {headers: { "Token": "" }, baseURL: apiHost4})
}
let getStationList = function (id, startTime = '', type = 0, count = 20) {
  let options = getUnMsgOption();
  if (startTime) {
    return fly.get(`/api/messages/station?stationId=${id}&type=${type}&count=${count}&startTime=${startTime}`, null, options)
  } else {
    return fly.get(`/api/messages/station?stationId=${id}&type=${type}&count=${count}`, null, options)
  }
}
let likeProgram = function (body) {
  let options = getUnMsgOption();
  return fly.post(`/api/message/favorite`, body, options)
}
let unLikeProgram = function (body) {
  let options = getUnMsgOption();
  return fly.post(`/api/message/unfavorite`, body, options)
}
let getComments = function (id, index, size = 20) {
  let options = getUnMsgOption();
  return fly.get(`/api/comments?messageId=${id}&pageIndex=${index}&pageSize=${size}`, null, options)
}
let addComment = function (body) {
  let options = getUnMsgOption();
  return fly.post(`/api/comment/add`, body, options)
}
let delComment = function (commentId) {
  let options = getUnMsgOption();
  return fly.delete(`/api/comment/${commentId}`, null, options)
}
let likeComment = function (body) {
  let options = getUnMsgOption();
  return fly.post(`/api/comment/like`, body, options)
}
let delikeComment = function (body) {
  let options = getUnMsgOption();
  return fly.post(`/api/comment/unlike`, body, options)
}
let shareVisit = function (body) {
  let options = getUnMsgOption();
  return fly.post(`/api/message/Visit`, body, options)
}
let takePartInVote = function (body) {
  let options = getUnMsgOption();
  return fly.post(`/api/message/vote`, body, options)
}
let getMessage = function (messageId) {
  let options = getUnMsgOption();
  return fly.get(`/api/message/${messageId}`, null, options)
}
// =============end============

let api = {
  appInt,
  // shuazhiboLogin,
  getUserToken,
  getPlayBackList,
  getFolderDetail,
  getSoundFileComment,
  getChildComments,
  getRichMedia,
  getSoundFileDetail,
  loadChannelDetail,
  getPassProgramList,
  addSoundfileComment,
  addCommentLike,
  cancelCommentLike,
  deleteSoundfileComment,
  addSoundfileLike,
  cancelSoundfileLike,
  getUniMsgToken,
  getStationList,
  likeProgram,
  unLikeProgram,
  getComments,
  addComment,
  delComment,
  likeComment,
  delikeComment,
  shareVisit,
  takePartInVote,
  getMessage,
  // roomId,
  apiHost:fly.config.baseURL,
  apiHost2,
  apiHost3,
  fly,
  postLocation,
  getRecommendStationList,
  getLocalStationsList,
  getProvinces,
  getProvinceStationsList,
  getCountryList,
}

export default api;