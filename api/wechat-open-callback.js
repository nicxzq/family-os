// api/wechat-open-callback.js — 开放平台扫码登录回调
// 流程: 校验 state → code 换 token（必含 unionid）→ loginOrCreate 统一处理
const { fail, verifyState, loginOrCreate } = require('./_wechat-shared');

module.exports = async function handler(req, res) {
  const { code } = req.query;
  if (!code) return fail(res, 'wechat_no_code');
  if (!verifyState(req)) return fail(res, 'wechat_bad_state');

  try {
    const token = await fetch(
      `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${process.env.WECHAT_OPEN_APPID}&secret=${process.env.WECHAT_OPEN_APPSECRET}&code=${code}&grant_type=authorization_code`
    ).then(r => r.json());

    if (!token.unionid) {
      console.error('WeChat Open token error:', token);
      return fail(res, 'wechat_auth_failed');
    }

    return await loginOrCreate(res, { unionid: token.unionid, openid: token.openid });
  } catch (err) {
    console.error('wechat-open-callback error:', err);
    return fail(res, 'server_error');
  }
};
