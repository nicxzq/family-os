// api/wechat-callback.js — 公众号 OAuth 回调（微信内置浏览器登录）
// 流程: 校验 state → code 换 token → unionid（须公众号已绑定开放平台；无则回退 openid）
//       → loginOrCreate 统一处理绑定/建号/magic link
const { fail, verifyState, loginOrCreate } = require('./_wechat-shared');

module.exports = async function handler(req, res) {
  const { code } = req.query;
  if (!code) return fail(res, 'wechat_no_code');
  if (!verifyState(req)) return fail(res, 'wechat_bad_state');

  try {
    const token = await fetch(
      `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${process.env.WECHAT_APPID}&secret=${process.env.WECHAT_APPSECRET}&code=${code}&grant_type=authorization_code`
    ).then(r => r.json());

    if (!token.openid) {
      console.error('WeChat MP token error:', token);
      return fail(res, 'wechat_auth_failed');
    }

    // 公众号绑定开放平台时 snsapi_base 也会返回 unionid；
    // 未绑定时以 mp_<openid> 作为绑定键（仅在公众号内唯一）。
    const unionid = token.unionid || `mp_${token.openid}`;
    return await loginOrCreate(res, { unionid, openid: token.openid });
  } catch (err) {
    console.error('wechat-callback error:', err);
    return fail(res, 'server_error');
  }
};
