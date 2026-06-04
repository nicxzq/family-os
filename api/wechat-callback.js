// api/wechat-callback.js — WeChat OAuth 回调处理
// 流程: code → openid → 查 wechat_bindings → 老用户生成 magic link / 新用户注册后生成 magic link
// 无 npm 依赖，全部用 Node 18+ 原生 fetch 调用 Supabase Admin REST API

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
    // 1. 用 code 换 openid
    const token = await fetch(
      `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${process.env.WECHAT_APPID}&secret=${process.env.WECHAT_APPSECRET}&code=${code}&grant_type=authorization_code`
    ).then(r => r.json());

    if (!token.openid) {
      console.error('WeChat token error:', token);
      return res.redirect(`${SITE}/?error=wechat_auth_failed`);
    }

    const { openid } = token;

    // 2. 查 wechat_bindings
    const bindings = await sb(
      `/rest/v1/wechat_bindings?openid=eq.${encodeURIComponent(openid)}&select=user_id`
    );

    if (Array.isArray(bindings) && bindings.length > 0) {
      // 3a. 老用户 — 拿邮箱生成 magic link → 重定向登录
      const user = await sb(`/auth/v1/admin/users/${bindings[0].user_id}`);
      const link = await sb('/auth/v1/admin/generate_link', {
        method: 'POST',
        body: JSON.stringify({ type: 'magiclink', email: user.email, redirect_to: `${SITE}/` }),
      });
      return res.redirect(link.action_link);
    }

    // 4. 新用户 — 创建账号 + 绑定 + 重定向到角色设置页
    const email = `wx${Buffer.from(openid).toString('base64url').slice(0, 20)}@fo.internal`;
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
      body: JSON.stringify({ openid, user_id: newUser.id }),
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
    console.error('wechat-callback error:', err);
    return res.redirect(`${SITE}/?error=server_error`);
  }
};
