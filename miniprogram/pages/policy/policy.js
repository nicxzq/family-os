// 隐私政策 / 免责说明 —— 一页两用，?type=privacy|disclaimer
const { buildShare, buildTimeline } = require('../../utils/share.js');

const CONTENT = {
  privacy: {
    navTitle: '隐私政策',
    title: '隐私政策',
    sections: [
      {
        heading: '数据存在哪里',
        body: [
          '这个小程序里的所有数据——头像和昵称、当前角色、阅读记录、每周回顾、零花钱账本、注意力打卡——都只保存在这台手机本地的小程序存储里，不会上传到任何服务器。',
          '头像会先在手机上完成 1:1 裁剪，再保存到本地，同样不会离开这台设备。'
        ]
      },
      {
        heading: '导出与导入',
        body: [
          '"我的"页面里的导出功能，只有你自己点击才会生成文件，并发送到你选择的聊天里；文件之后怎么保管，由你自己决定，我们不会经手。'
        ]
      },
      {
        heading: '没有第三方统计',
        body: [
          '这个小程序不接入任何第三方统计或广告 SDK，不追踪使用行为。'
        ]
      },
      {
        heading: '删除即清空',
        body: [
          '把小程序从微信里删除，本地保存的全部数据会一并清除，无法找回——重要的记录建议提前导出备份。'
        ]
      },
      {
        heading: '联系我们',
        body: [
          '如果对隐私处理有任何疑问或建议，欢迎写信到 ocular.sunsets0a@icloud.com。'
        ]
      }
    ]
  },
  disclaimer: {
    navTitle: '免责说明',
    title: '免责说明',
    sections: [
      {
        heading: '内容来源',
        body: [
          '这个小程序里的想法、故事、读本和测试题，都是根据李笑来公开出版和分享的家庭教育材料整理而成，力求忠实于原文。'
        ]
      },
      {
        heading: '使用场景',
        body: [
          '所有内容仅供本家庭内部的学习和交流使用，不构成任何专业的教育、心理或医疗建议——遇到具体问题，请咨询相应的专业人士。'
        ]
      },
      {
        heading: '游戏与工具',
        body: [
          '小程序里的小游戏和工具（比如零花钱账本、注意力打卡）都是教育用途，不涉及真实交易或诊断。'
        ]
      },
      {
        heading: '版权说明',
        body: [
          '如果内容涉及第三方权利、需要处理，请联系 ocular.sunsets0a@icloud.com，我们会尽快处理。'
        ]
      }
    ]
  }
};

Page({
  data: {
    type: 'privacy',
    content: CONTENT.privacy
  },

  onLoad(options) {
    const type = options.type === 'disclaimer' ? 'disclaimer' : 'privacy';
    const content = CONTENT[type];
    wx.setNavigationBarTitle({ title: content.navTitle });
    this.setData({ type: type, content: content });
  },

  onShareAppMessage() {
    return buildShare(this.data.content.title, '/pages/policy/policy?type=' + this.data.type);
  },

  onShareTimeline() {
    return buildTimeline(this.data.content.title, 'type=' + this.data.type);
  }
});
