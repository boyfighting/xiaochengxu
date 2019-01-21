var Fly=require("./wx.umd.min.js") //wx.js is your downloaded code
var fly=new Fly(); //Create an instance of Fly

// Add interceptors
fly.interceptors.request.use((config,promise)=>{
  wx.showLoading({
    title: '加载中',
    mask:true
  })
  // Add custom headers
  
  return config;
})
fly.interceptors.response.use(
  (response,promise) => {
    if(typeof (response.data)=='string' && response.data!=''){
      response.data=JSON.parse(response.data);
    }

    if(response.data.code=="C501"){
      
      
    }
    wx.hideLoading()

    // response.data=Mock.mock(response.data)
    // Do something with response data .
    // Just return the data field of response

  },
  (err,promise) => {
    // Do something with response error
    //promise.resolve("ssss")
    wx.hideLoading()
  }

)
// Set the base url
fly.config.baseURL="https://fm.muzhiyun.cn"
// Set the headers and Token
var token = wx.getStorageSync('Token') || ""
if (token)fly.config.headers = { "Token": token }

export default fly;