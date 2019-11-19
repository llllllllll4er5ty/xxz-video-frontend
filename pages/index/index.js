const app = getApp()

Page({
  data: {
    videoList: [],
    baseUrl: app.base_url,
    baseStaticUrl: app.base_static_url,
    screenWidth: 0,
    pageStart: 1,
    pageNum: 5,
    pageTotal: 1,
  },

  onLoad: function (params) {
    var that = this;

    var width = wx.getSystemInfoSync().screenWidth;
    that.setData({
      screenWidth: width,
    });
 
    // 加载视频列表
    var pageNum = that.data.pageNum;
    that.getVideoList(1, pageNum);
  },

  // 拉到最底部刷新
  onReachBottom() {
    var that = this;
    // 原来的视频列表
    var videoList = that.data.videoList;

    // 加载新的视频
    var pageStart = that.data.pageStart;
    var pageNum = that.data.pageNum;
    pageStart = pageStart + 1;
    that.setData({
      pageStart: pageStart,
    })
    that.getVideoList(pageStart, pageNum);
  },

  // 获取视频列表
  getVideoList(start, pageNum) {
    var that = this;
    var pageTotal = that.data.pageTotal;
    if (start > pageTotal) {
      wx.showToast({
        title: '没有更多视频了...',
        icon: 'none',
      })
      return;
    }
    
    wx.showLoading({
      title: '获取视频列表中...',
    })
    wx.request({
      url: app.base_url + '/video/list',
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      data: {
        start: start,
        pageNum: pageNum,
      },

      success(res) {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
        var code = res.data.code;
        if (code == 200) {
          // 判断是否是第一页
          var videoList = that.data.videoList;
          if (start === 1) {
            videoList = [];
          }

          // 将之前的视频列表与新的视频列表合并
          var result = res.data.data.videoList;
          videoList = videoList.concat(result);
          that.setData({
            pageTotal: res.data.data.pageTotal,
            videoList: videoList,
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

  // 下拉刷新
  onPullDownRefresh: function (params) {
    var that = this;
    wx.showNavigationBarLoading();
    that.setData({
      pageStart: 1,
    })
    var pageNum = that.data.pageNum;
    that.getVideoList(1, pageNum);
  },

  // 视频详情跳转
  showVideoInfo(e) {
    var index = e.currentTarget.dataset.arrayIndex;
    var videoId = this.data.videoList[index].id;
    var videoPath = this.data.videoList[index].videoPath;
    var videoDesc = this.data.videoList[index].videoDesc;
    var userId = this.data.videoList[index].userEntity.id;
    var avatar = this.data.videoList[index].userEntity.avatar;
    var name = this.data.videoList[index].userEntity.name;

    wx.navigateTo({
      url: '../videoInfo/videoInfo?videoPath=' + videoPath
        + '&videoId=' + videoId 
          + '&videoDesc=' + videoDesc
          + '&userId=' + userId
          + '&avatar=' + avatar 
          + '&name=' + name,
    })
  }
})
