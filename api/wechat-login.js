// api/wechat-login.js — WeChat OAuth 入口，重定向到微信授权页
module.exports = function (req, res) {
  const appid = process.env.WECHAT_APPID;
  if (!appid) return res.status(500).send('WECHAT_APPID not configured');
  const cb = encodeURIComponent('https://family.carlxu.cn/api/wechat-callback');
  res.redirect(302,
    `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${cb}&response_type=code&scope=snsapi_base&state=fo2026#wechat_redirect`
  );
};
