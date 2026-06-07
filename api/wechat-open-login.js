// api/wechat-open-login.js — WeChat Open Platform QR login entry
module.exports = function (req, res) {
  const appid = process.env.WECHAT_OPEN_APPID;
  if (!appid) return res.status(500).send('WECHAT_OPEN_APPID not configured');

  const cb = encodeURIComponent('https://family.carlxu.cn/api/wechat-open-callback');
  const state = Math.random().toString(36).slice(2);

  res.redirect(302,
    `https://open.weixin.qq.com/connect/qrconnect?appid=${appid}&redirect_uri=${cb}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`
  );
};
