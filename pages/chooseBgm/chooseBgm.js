const app = getApp()

Page({
    data: {
      baseUrl: app.base_url,
      baseStaticUrl: app.base_static_url,
      bgmList:[],
      // 从上传视频页面传过来的参数
      params: {},
    },

    onLoad: function (params) {
      var that = this;
      that.setData({
        params: params,
      })

      var baseUrl = app.base_url;
      wx.showLoading({
        title: '加载背景音乐列表中...',
      })
      // 加载bgm列表
      wx.request({
        url: baseUrl + '/bgm/list',
        method: 'POST',
        header: {
          'content-type': 'application/json' // 默认值
        },
        data: {
          start: '0',
          pageNum: '10',
        },

        success(res) {
          wx.hideLoading();
          var code = res.data.code;
          if (code == 200) {
            that.setData({
              bgmList: res.data.data,
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
          wx.hideLoading();
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 3000
          })
        }
      })
    },

    // 上传视频
    upload(e) {
      var videoDesc = e.detail.value.desc;
      var bgmId = e.detail.value.bgmId;
      // 用户信息保存在本地storage中
      // var userInfo = app.userInfo;
      var userInfo = wx.getStorageSync("userInfo");

      var videoDuration = this.data.params.duration;
      var videoHeight = this.data.params.height;
      var videoSize = this.data.params.size;
      var videoPath = this.data.params.videoPath;
      var videoWidth = this.data.params.width;

      wx.uploadFile({
        url: app.base_url + "/video/upload",
        filePath: videoPath,
        name: 'file',
        formData: {
          userId: userInfo.userEntity.id,
          videoSize: videoSize,
          videoDesc: videoDesc,
          bgmId: bgmId,
          videoSeconds: videoDuration,
          videoWidth: videoWidth,
          videoHeight: videoHeight
          
        },
        success(res) {
          var dataObj = JSON.parse(res.data);
          wx.hideLoading();
          var code = dataObj.code;
          if (code == 200) {
            wx.showToast({
              title: '上传成功',
              icon: 'success',
              duration: 3000
            });

            // 返回到我的页面
            wx.navigateBack({
              delta: -1
            })

          } else {
            wx.showToast({
              title: dataObj.msg,
              icon: 'none',
              duration: 3000
            })
          }
        },
        fail(res) {
          var dataObj = JSON.parse(res.data);
          wx.hideLoading();
          wx.showToast({
            title: dataObj.msg,
            icon: 'none',
            duration: 3000
          })
        }
      })
    }
})

