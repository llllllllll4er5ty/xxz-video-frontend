const app = getApp();

Page({
  data: {

  },

  doRegist(e) {
    var formObj = e.detail.value;
    var username = formObj.username;
    var password = formObj.password;

    // 校验
    if (username.length == 0 || password.length == 0) {
      wx.showToast({
        title: '用户名或密码不能为空',
        icon: 'none',
        duration: 3000
      })
    } else {
      var baseUrl = app.base_url;

      wx.request({
        url: baseUrl + '/register/save',
        method: 'POST',
        data: {
          name : username,
          password : password
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          var code = res.data.code;
          if (code == 200) {
            // 用户信息保存在storage中
            // app.userInfo = res.data.data;
            wx.setStorageSync("userInfo", res.data.data);
            wx.showToast({
              title: '注册成功',
              icon: 'success',
              duration: 3000
            })
          } else {
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 3000
            })
          }
        },
        fail(res) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 3000
          })
        }
      })
    }
  },
  // 跳转到注册页面
  goLoginPage() {
    wx.redirectTo({
      url: '../userLogin/userLogin',
    })
  }
})