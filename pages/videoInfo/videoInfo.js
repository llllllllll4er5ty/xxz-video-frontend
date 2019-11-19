var videoUtil = require('../../utils/videoUtil.js')

const app = getApp()

Page({
  data: {
    cover: "cover",  
    commentFocus: false,
    src: '',
    baseStaticUrl: app.base_static_url,
    baseUrl: app.base_url,
    // 用户信息（发布视频者）
    publisher: {
      id: null,
      name: '',
      avatar: '',
    },
    // 视频信息
    videoInfo: {
      id: null,
      desc: '',
    },
    placeholderInit: "此刻的心情是什么呢...",
    placeholder: "此刻的心情是什么呢...",
    userInfo: null,
    commentsList: [],
    // 分页参数
    start: 1,
    pageNum: 10,
    pageTotal: 1,

    // 评论回复参数
    replyFatherCommentId: null,
    replyToUserId: null,
  },

  onLoad: function (params) {
    var that = this;
    that.setData({
      userInfo: wx.getStorageSync("userInfo"),
    })
    var videoId = params.videoId;
    var videoPath = params.videoPath;
    var videoDesc = params.videoDesc;
    var userId = params.userId;
    var avatar = params.avatar;
    var name = params.name;

    that.setData({
      // 用户信息
      publisher: {
        id: userId,
        name: name,
        avatar: avatar,
      },
      // 视频信息
      videoInfo: {
        id: videoId,
        desc: videoDesc,
      }
    });

    // 视频地址
    var src = that.data.baseStaticUrl + videoPath;
    that.setData({
      src: src,
    });

    // 获取评论列表
    var start = that.data.start;
    var pageNum = that.data.pageNum;
    that.getCommentsList(start, pageNum);
    
  },

  onShow: function () {
    
  },

  onHide: function () {
    
  },

  showSearch() {
    wx.navigateTo({
      url: '../searchVideo/searchVideo',
    })
  },
  leaveComment() {
    var flag = this.data.commentFocus;
    this.setData({
      commentFocus: !flag,
    })
  },

  // 保存评论
  saveComment(e) {
    var that = this;
    var comment = e.detail.value;
    var toUserId = e.currentTarget.dataset.replyToUserId;
    var fatherId = e.currentTarget.dataset.replyFatherCommentId;

    wx.showLoading({
      title: '保存评论中...',
    })
    
    wx.request({
      url: this.data.baseUrl + '/comment/save',
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      data: {
        userId: that.data.userInfo.userEntity.id,
        videoId: that.data.videoInfo.id,
        comment: comment,
        toUserId: toUserId,
        fatherId: fatherId,
      },

      success(res) {
        wx.hideLoading();
        var code = res.data.code;
        if (code == 200) {
          wx.showToast({
            title: '发表成功!',
          })
          var pageTotal = that.data.pageTotal;
          if (pageTotal === 0) {
            // 页面载入的时候，如果没有评论，会将pageTotal置为0，之后再获取列表时就不会查询接口了
            // 所以第一条评论保存成功的时候，要将pageTotal置为1
            pageTotal = 1;
          }
          that.setData({
            contentValue: '',
            placeholder: that.data.placeholderInit,
            pageTotal: pageTotal,
          })
          // 刷新评论列表
          var pageNum = that.data.pageNum;
          that.getCommentsList(1, pageNum);
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

  // 获取评论列表的方法
  getCommentsList(start, pageNum) {

    var that = this;
    var pageTotal = that.data.pageTotal;
    if (start > pageTotal) {
      wx.showToast({
        title: '没有更多评论了...',
        icon: 'none',
      })
      return;
    }

    wx.showLoading({
      title: '获取评论列表中...',
    })
    wx.request({
      url: this.data.baseUrl + '/comment/list',
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      data: {
        videoId: that.data.videoInfo.id,
        start: start,
        pageNum: pageNum,
      },

      success(res) {
        wx.hideLoading();
        var code = res.data.code;
        if (code == 200) {
          var commentsList = that.data.commentsList;
          if (start === 1) {
            commentsList = [];
          }

          var newList = res.data.data.commentsList;
          commentsList = commentsList.concat(newList);
          
          that.setData({
            commentsList: commentsList,
            pageTotal: res.data.data.pageTotal,
            start: start + 1, 
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

  // 屏幕触底加载更多评论
  onReachBottom() {
    var that = this;
    // 获取评论列表
    var start = that.data.start;
    var pageNum = that.data.pageNum;
    that.getCommentsList(start, pageNum);
  },

  // 回复评论
  replyFocus(e) {
    var that = this;

    var fatherCommentId = e.currentTarget.dataset.fatherCommentId;
    var toUserId = e.currentTarget.dataset.toUserId;
    var toUserName = e.currentTarget.dataset.toUserName;
    that.setData({
      commentFocus: true,
      replyToUserId: toUserId,
      replyFatherCommentId: fatherCommentId,
      placeholder: '回复' + toUserName,
    })
  },

  showPublisher() {
    var that = this;
    wx.navigateTo({
      url: '../userInfo/userInfo?userId=' + that.data.publisher.id,
    })
  },

  // 跳转到个人信息界面
  showMine() {
    var that = this;
    wx.navigateTo({
      url: '../userInfo/userInfo?userId=' + that.data.userInfo.userEntity.id,
    })
  }
  
})