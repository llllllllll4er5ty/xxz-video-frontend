const app = getApp();

Page({
  data: {
    faceUrl: "../resource/images/noneface.png",
    baseUrl: app.base_url,
    baseStaticUrl: app.base_static_url,
    isMe: true,
    isFollow: false,
    videoList: [],
    maxFileSize: app.max_file_size,
    userInfo: null,
    // 登录的用户实体
    loginUser: null,
    // 要显示的用户的信息
    user: null,
  },

  onLoad(param) {
    var that = this;
    that.setData({
      userInfo: wx.getStorageSync("userInfo"),
      loginUser: wx.getStorageSync("userInfo").userEntity,
    })
    
    var userId = parseInt(param.userId);
    var localUserId = that.data.loginUser.id;
    
    var isMe = userId !== localUserId ? false : true;
    that.setData({
      isMe: isMe,
    });
    if (!isMe) {
      // 判断是否已经关注
      wx.request({
        url: that.data.baseUrl + "/user/isFollow?userId=" + userId + "&followUserId=" + localUserId,
        method: 'POST',
        header: {
          'content-type': 'application/json' // 默认值
        },

        success(res) {
          wx.hideLoading();
          var code = res.data.code;

          if (code == 200) {
            that.setData({
              isFollow: res.data.data,
            })
          } else {
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 3000
            })
          }
        }
      })
    };

    // 获取用户信息
    wx.request({
      url: that.data.baseUrl + '/user/get?userId=' + userId,
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },

      success(res) {
        wx.hideLoading();
        var code = res.data.code;

        if (code == 200) {
          that.setData({
            user: res.data.data,
          })
          that.setUserInfo(that.data.user);
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 3000
          })
        }
      }
    });

    // 获取视频列表
    wx.showLoading({
      title: '获取视频列表中...',
    })
    wx.request({
      url: this.data.baseUrl + "/video/list",
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      data: {
        userId: userId,
      },

      success(res) {
        wx.hideLoading();
        var code = res.data.code;
        if (code == 200) {
          that.setData({
            videoList: res.data.data.videoList,
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

  // 设置用户显示信息
  setUserInfo(user) {
    var that = this;
    var avatar = user.avatar;
    if (avatar != null && avatar != undefined && avatar != '') {
      avatar = app.base_static_url + avatar;
    } else {
      avatar = this.data.faceUrl;
    };

    that.setData({
      faceUrl: avatar,
      nickname: user.name,
      fansCounts: user.fansCounts,
      followsCounts: user.followsCounts,
      receiveLikeCounts: user.receiveLikeCounts
    });
  },

  logout() {
    // 用户信息保存在本地storage中
    // var userInfo = app.userInfo;
    var userInfo = wx.getStorageSync("userInfo");

    wx.showLoading({
      title: '注销中...',
    });

    wx.request({
      url: this.data.baseUrl + "/login/doLogout?userId=" + userInfo.userEntity.id,
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      
      success(res) {
        var code = res.data.code;
        wx.hideLoading();
        if (code == 200) {
          // 清空本地存储的用户信息
          // app.userInfo = null;
          wx.removeStorageSync("userInfo");
          wx.showToast({
            title: '注销成功',
            icon: 'success',
            duration: 3000
          });
          // 登录成功后跳转到登录页面
          wx.redirectTo({
            url: '../userLogin/userLogin',
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 3000
          })
        }
      }
    })
  },

  // 修改头像
  changeFace() {
    var that = this;

    // 用户信息保存在本地storage中
    // var userInfo = app.userInfo;
    var userInfo = that.data.userInfo;

    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths;

        // 请求后端
        wx.showLoading({
          title: '上传中...',
        });

        wx.uploadFile({
          url: app.base_url + "/user/changeAvatar?userId=" + userInfo.userEntity.id,
          filePath: tempFilePaths[0],
          name: 'files',
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

              // 及时更改用户头像
              that.setData({
                faceUrl: app.base_static_url + dataObj.data,
              });
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
      },
      fail(res) {
        
      }
    })
  },

  // 上传视频
  uploadVideo() {
    var that = this;

    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success(res) {

        if (res.size > that.data.maxFileSize) {
          wx.showToast({
            icon: "none",
            title: '请选择大小在10MB内的视频',
          })
          return;
        }

        if (res.duration < 1 || res.duration >= 11) {
          wx.showToast({
            icon: "none",
            title: '请选择时长在1-10s的视频',
          })
        } else {
          // 跳转到选择bgm界面
          wx.navigateTo({
            url: '../chooseBgm/chooseBgm?videoPath=' + res.tempFilePath
              + "&duration=" + res.duration
              + "&size=" + res.size
              + "&height=" + res.height
              + "&width=" + res.width
            ,

          })
        }

      }
    })
  },

  // 点击关注/取消关注
  followMe(e) {
    var that = this;
    var followType = parseInt(e.currentTarget.dataset.followType);
    if (followType === 1) {
      // 添加关注
      wx.request({
        url: that.data.baseUrl + "/user/follow?userId=" + that.data.user.id + "&followUserId=" + that.data.loginUser.id,
        method: 'POST',
        header: {
          'content-type': 'application/json' // 默认值
        },

        success(res) {
          var code = res.data.code;
          wx.hideLoading();
          if (code == 200) {
            that.setUserInfo(res.data.data);
            that.setData({
              isFollow: true,
            })
            wx.showToast({
              title: "关注成功",
              icon: 'success',
              duration: 3000
            });
          } else {
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 3000
            })
          }
        }
      })
    } else {
      // 取消关注
      wx.request({
        url: that.data.baseUrl + "/user/unFollow?userId=" + that.data.user.id + "&followUserId=" + that.data.loginUser.id,
        method: 'POST',
        header: {
          'content-type': 'application/json' // 默认值
        },

        success(res) {
          var code = res.data.code;
          wx.hideLoading();
          if (code == 200) {
            that.setUserInfo(res.data.data);
            that.setData({
              isFollow: false,
            })
            wx.showToast({
              title: "取消成功",
              icon: 'success',
              duration: 3000
            });
          } else {
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 3000
            })
          }
        }
      })
    }
    
  },
})
