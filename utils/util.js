import api from '../api/index';
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
function formatTime3(time) {
  if (typeof time !== 'number' || time < 0) {
    return time
  }

  var minute = parseInt(time / 60)
  time = time % 60
  var second = time

  return ([minute, second]).map(function (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }).join(':')
}

const uuid = () => {
  var d = new Date().getTime();
  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);  
    return (c = 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
  return uuid;
}

const unionBy = (oldArr, newArr, identity = 'id') => {
  if(oldArr instanceof Array && newArr instanceof Array && identity) {
    if(oldArr.length === 0) {
      return newArr;
    } else {
      oldArr.map((ele, idx) => {
        let id = ele[identity];
        newArr = newArr.filter((res, index) => {
          return res[identity] !== id;
        })
      })
      return [...oldArr, ...newArr];
    }
  } else {
    return [];
  }
}

const toPlaySong = (songid) => {
  return `${api.apiHost3}/Assist/Share/WxSong/?songid=${songid}&appkey=A0476ED9E6C2FF6C&from=singlemessage&isappinstalled=1`;
}

function getLocalTime(nS) { // 转化后的时间戳
  return new Date(parseInt(nS)).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ").split(" ")[0];
}

const timeDifference = (tmpTime) => { // 获取时间差 接受一个时间戳
  var mm = 1000;// 1000毫秒 代表1秒
  var minute = mm * 60;
  var hour = minute * 60;
  var day = hour * 24;
  var month = day * 30;
  var ansTimeDifference = 0;// 记录时间差
  // var tmpTimeStamp = tmpTime ? Date.parse(tmpTime.replace(/-/gi, "/")) : new Date().getTime();//将 yyyy-mm-dd H:m:s 进行正则匹配
  var tmpTimeStamp = tmpTime || new Date().getTime();// 将 yyyy-mm-dd H:m:s 进行正则匹配
  var nowTime = new Date().getTime();// 获取当前时间戳
  var tmpTimeDifference = nowTime - tmpTimeStamp;// 计算当前与需要计算的时间的时间戳的差值
  if (tmpTimeDifference < -5) {                // 时间超出，不能计算
    console.log('开始日期大于结束日期，计算错误！');
    return '刚刚';
  }
  /**
   * 通过最开始强调的各个时间段用毫秒表示的数值，进行时间上的取整，为0的话，则没有到达
   * */
  var DifferebceMonth = tmpTimeDifference / month;    // 进行月份取整
  var DifferebceWeek = tmpTimeDifference / (7 * day);// 进行周取整
  var DifferebceDay = tmpTimeDifference / day;// 进行天取整
  var DifferebceHour = tmpTimeDifference / hour;// 进行小时取整
  var DifferebceMinute = tmpTimeDifference / minute;// 进行分钟取整
  if (DifferebceMonth >= 1) {
    return getLocalTime(tmpTime);                 // 大于一个月 直接返回时间
  } else if (DifferebceWeek >= 1) {
    ansTimeDifference = parseInt(DifferebceWeek) + "个星期前";
  } else if (DifferebceDay >= 1) {
    ansTimeDifference = parseInt(DifferebceDay) + "天前";
  } else if (DifferebceHour >= 1) {
    ansTimeDifference = parseInt(DifferebceHour) + "个小时前";
  } else if (DifferebceMinute >= 1) {
    ansTimeDifference = parseInt(DifferebceMinute) + "分钟前";
  } else {
    ansTimeDifference = "刚刚";
  }
  return ansTimeDifference;
}

let withSZBHttp = (url) => {
  if (url && url.indexOf('http') !== 0) {
    url = 'http://image.mzliaoba.com/' + url;
  }
  return url;
};

let withAudioHttp = (url) => {
  if (url && url.indexOf('http') !== 0) {
    url = 'http://liaoba-av-prod.oss-cn-beijing.aliyuncs.com/' + url;
  }
  return url;
};

let withMZYHttp = (url) => {
  if (url && url.indexOf('http') !== 0) {
    url = 'http://images.muzhiyun.cn/' + url;
  }
  return url;
};

let MillisecondToDate = (msd) => {
  if (!msd) return '';
  var time = parseFloat(msd) / 1000;
  if (time !== null && time !== '') {
    if (time > 60 && time < 60 * 60) {
      time = parseInt(time / 60.0) + '分' + parseInt((parseFloat(time / 60.0) - parseInt(time / 60.0)) * 60) + '秒';
    } else if (time >= 60 * 60 && time < 60 * 60 * 24) {
      time = parseInt(time / 3600.0) + '小时' + parseInt((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60) + '分钟' +
        parseInt((parseFloat((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60) - parseInt((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60)) * 60) + '秒';
    } else {
      time = parseInt(time) + '秒';
    }
  } else {
    time = '0 时 0 分0 秒';
  }
  return time;
}


let sec_to_time = function (s) {
  var t;
  if (s > -1) {

    var min = Math.floor(s / 60) ;
    var sec = s % 60;
    if (min < 10) { t = '0' + min + ":"; }else{
      t = min + ":";
    }
    if (sec < 10) { t += "0"; }
    t += Math.floor(sec);
  }
  return t;
}

const timeTransform = function (time) {
  var nowtime = new Date().getTime() / 1000;
  var differenttime = nowtime - time;
  var monthDifferent = Math.floor(differenttime / (30 * 24 * 3600));
  var weekDifferent = Math.floor(differenttime / (7 * 24 * 3600));
  var dayDifferent = Math.floor(differenttime / (24 * 3600));
  var hourDifferent = Math.floor(differenttime / 3600);
  var minuteDifferent = Math.floor(differenttime / 60);
  if (differenttime < 59) {
    time = '刚刚'
    return time
  } else if (monthDifferent >= 1) {
    time = monthDifferent + '月前'
    return time
  } else if (weekDifferent >= 1) {
    time = weekDifferent + '周前'
    return time
  } else if (dayDifferent >= 1) {
    time = dayDifferent + '天前'
    return time
  } else if (hourDifferent >= 1) {
    time = hourDifferent + '小时前'
    return time
  }
  else if (minuteDifferent >= 1) {
    time = minuteDifferent + '分钟前'
    return time
  }
}

module.exports = {
  formatTime: formatTime,
  formatTime3: formatTime3,
  uuid: uuid,
  timeDifference,
  withSZBHttp,
  withMZYHttp,
  getLocalTime,
  withAudioHttp,
  MillisecondToDate,
  timeTransform,
  toPlaySong,
  unionBy,
  sec_to_time,
}
