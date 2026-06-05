// api/wechat-open-callback.js — WeChat Open Platform QR login callback
// Flow: code → unionid → query wechat_bindings → magic link for existing user / create user then setup
// No npm dependencies; uses Node 18+ native fetch with Supabase Admin REST API.

const SUPABASE_URL = 'https://zdmhnwxwblpzcjgszqpj.supabase.co';
const SITE = 'https://family.carlxu.cn';

async function sb(path, opts = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...opts,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

module.exports = async function handler(req, res) {
  const { code } = req.query;
  if (!code) return res.redirect(`${SITE}/?error=wechat_no_code`);

  try {
    // 1. Use code to get access_token + unionid.
    const token = await fetch(
      `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${process.env.WECHAT_OPEN_APPID}&secret=${process.env.WECHAT_OPEN_APPSECRET}&code=${code}&grant_type=authorization_code`
    ).then(r => r.json());

    if (!token.unionid) {
      console.error('WeChat Open token error:', token);
      return res.redirect(`${SITE}/?error=wechat_auth_failed`);
    }

    const { unionid, openid } = token;

    // 2. Query wechat_bindings by unionid.
    const bindings = await sb(
      `/rest/v1/wechat_bindings?unionid=eq.${encodeURIComponent(unionid)}&select=user_id`
    );

    if (Array.isArray(bindings) && bindings.length > 0) {
      // 3a. Existing user — generate magic link and redirect into a Supabase session.
      const user = await sb(`/auth/v1/admin/users/${bindings[0].user_id}`);
      const link = await sb('/auth/v1/admin/generate_link', {
        method: 'POST',
        body: JSON.stringify({ type: 'magiclink', email: user.email, redirect_to: `${SITE}/` }),
      });
      return res.redirect(link.action_link);
    }

    // 4. New user — create account, bind unionid, then redirect to setup.
    const email = `wx_${unionid.slice(0, 18)}@fo.internal`;
    const newUser = await sb('/auth/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email,
        email_confirm: true,
        user_metadata: { name: '新成员', avatar: 'chick', color: 'coral', role: 'child', family_role: '' },
      }),
    });

    if (!newUser?.id) {
      console.error('Create user failed:', newUser);
      return res.redirect(`${SITE}/?error=create_user_failed`);
    }

    await sb('/rest/v1/wechat_bindings', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ unionid, openid, user_id: newUser.id }),
    });

    const link = await sb('/auth/v1/admin/generate_link', {
      method: 'POST',
      body: JSON.stringify({
        type: 'magiclink',
        email,
        redirect_to: `${SITE}/login.html?setup=1`,
      }),
    });
    return res.redirect(link.action_link);

  } catch (err) {
    console.error('wechat-open-callback error:', err);
    return res.redirect(`${SITE}/?error=server_error`);
  }
};
