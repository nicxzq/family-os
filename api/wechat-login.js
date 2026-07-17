// api/wechat-login.js — 公众号 OAuth 入口（微信内置浏览器），重定向到微信授权页
const { issueState } = require('./_wechat-shared');

module.exports = function (req, res) {
  const appid = process.env.WECHAT_APPID;
  if (!appid) return res.status(500).send('WECHAT_APPID not configured');

  const cb = encodeURIComponent('https://family.carlxu.cn/api/wechat-callback');
  const state = issueState(res);

  res.redirect(302,
    `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${cb}&response_type=code&scope=snsapi_base&state=${state}#wechat_redirect`
  );
};
