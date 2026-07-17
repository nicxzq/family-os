// api/_wechat-shared.js — shared logic for both WeChat login flows.
// Underscore prefix: Vercel does not expose this file as a route.

const SUPABASE_URL = 'https://zdmhnwxwblpzcjgszqpj.supabase.co';
const SITE = 'https://family.carlxu.cn';
const STATE_COOKIE = 'fo_wx_state';

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

function fail(res, code) {
  return res.redirect(`${SITE}/login.html?error=${code}`);
}

// CSRF: issue a random state and remember it in an httpOnly cookie.
function issueState(res) {
  const state = Math.random().toString(36).slice(2) + Date.now().toString(36);
  res.setHeader(
    'Set-Cookie',
    `${STATE_COOKIE}=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  );
  return state;
}

// CSRF: callback must carry the same state we issued.
function verifyState(req) {
  const state = req.query && req.query.state;
  const cookies = req.headers.cookie || '';
  const m = cookies.match(new RegExp(`(?:^|;\\s*)${STATE_COOKIE}=([^;]+)`));
  return !!(state && m && m[1] === state);
}

// Core: given a WeChat identity, sign the user in via Supabase magic link.
// unionid is the binding key (cross-app unique); openid kept for reference.
async function loginOrCreate(res, { unionid, openid }) {
  const bindings = await sb(
    `/rest/v1/wechat_bindings?unionid=eq.${encodeURIComponent(unionid)}&select=user_id`
  );

  if (Array.isArray(bindings) && bindings.length > 0) {
    // Existing user — magic link straight in.
    const user = await sb(`/auth/v1/admin/users/${bindings[0].user_id}`);
    if (!user || !user.email) {
      console.error('Binding points to missing user:', bindings[0].user_id);
      return fail(res, 'wechat_binding_stale');
    }
    const link = await sb('/auth/v1/admin/generate_link', {
      method: 'POST',
      body: JSON.stringify({ type: 'magiclink', email: user.email, redirect_to: `${SITE}/` }),
    });
    if (!link || !link.action_link) {
      console.error('generate_link failed:', link);
      return fail(res, 'magiclink_failed');
    }
    return res.redirect(link.action_link);
  }

  // New user — create account, bind, then send to profile setup.
  const email = `wx_${unionid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 18).toLowerCase()}@fo.internal`;
  const newUser = await sb('/auth/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify({
      email,
      email_confirm: true,
      user_metadata: { name: '新成员', avatar: 'chick', color: 'coral', role: 'child', family_role: '' },
    }),
  });
  if (!newUser || !newUser.id) {
    console.error('Create user failed:', newUser);
    return fail(res, 'create_user_failed');
  }

  const bindRes = await sb('/rest/v1/wechat_bindings', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ unionid, openid: openid || null, user_id: newUser.id }),
  });
  if (!Array.isArray(bindRes) || bindRes.length === 0) {
    console.error('Bind insert failed:', bindRes);
    return fail(res, 'bind_failed');
  }

  const link = await sb('/auth/v1/admin/generate_link', {
    method: 'POST',
    body: JSON.stringify({ type: 'magiclink', email, redirect_to: `${SITE}/login.html?setup=1` }),
  });
  if (!link || !link.action_link) {
    console.error('generate_link failed:', link);
    return fail(res, 'magiclink_failed');
  }
  return res.redirect(link.action_link);
}

module.exports = { SITE, sb, fail, issueState, verifyState, loginOrCreate };
