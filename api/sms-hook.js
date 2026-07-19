// api/sms-hook.js — Supabase "Send SMS Hook" → 阿里云短信 Dysmsapi
//
// Supabase 在用户请求短信验证码时 POST 到这里：
//   { user: { phone: "+8613800138000", ... }, sms: { otp: "123456" } }
// 返回 200 空响应 = 成功；非 200 = Supabase 向前端报错。
//
// 鉴权：hook URL 里带一个不可猜的 ?key=<SMS_HOOK_KEY>。
// Supabase HTTP hook 不能自定义请求头，URL 密钥是最直接的来源校验，
// 且不受 Vercel body 解析影响（无需还原 raw body 验 HMAC）。
//
// 需要的环境变量（Vercel）：
//   SMS_HOOK_KEY               自己生成的长随机串，同时写进 Supabase hook URL
//   ALI_SMS_ACCESS_KEY_ID      阿里云 AccessKey ID
//   ALI_SMS_ACCESS_KEY_SECRET  阿里云 AccessKey Secret
//   ALI_SMS_SIGN_NAME          已审核通过的短信签名，如「家庭OS」
//   ALI_SMS_TEMPLATE_CODE      验证码模板 CODE，如 SMS_123456789
//                              （模板内容形如「验证码 ${code}，5 分钟内有效」）

const crypto = require('crypto');

// 阿里云 RPC 专用百分号编码
function pe(s) {
  return encodeURIComponent(s)
    .replace(/\+/g, '%20')
    .replace(/\*/g, '%2A')
    .replace(/%7E/g, '~');
}

async function aliyunSendSms({ phone, code }) {
  const params = {
    AccessKeyId:      process.env.ALI_SMS_ACCESS_KEY_ID,
    Action:           'SendSms',
    Format:           'JSON',
    RegionId:         'cn-hangzhou',
    SignatureMethod:  'HMAC-SHA1',
    SignatureNonce:   crypto.randomUUID(),
    SignatureVersion: '1.0',
    Timestamp:        new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    Version:          '2017-05-25',
    PhoneNumbers:     phone,
    SignName:         process.env.ALI_SMS_SIGN_NAME,
    TemplateCode:     process.env.ALI_SMS_TEMPLATE_CODE,
    TemplateParam:    JSON.stringify({ code }),
  };

  const canonical = Object.keys(params).sort()
    .map(k => `${pe(k)}=${pe(params[k])}`).join('&');
  const stringToSign = `GET&${pe('/')}&${pe(canonical)}`;
  const signature = crypto
    .createHmac('sha1', process.env.ALI_SMS_ACCESS_KEY_SECRET + '&')
    .update(stringToSign).digest('base64');

  const url = `https://dysmsapi.aliyuncs.com/?${canonical}&Signature=${pe(signature)}`;
  const resp = await fetch(url).then(r => r.json());
  if (resp.Code !== 'OK') {
    throw new Error(`${resp.Code}: ${resp.Message}`);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!process.env.SMS_HOOK_KEY || req.query.key !== process.env.SMS_HOOK_KEY) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const rawPhone = body && body.user && body.user.phone;
    const otp      = body && body.sms && body.sms.otp;
    if (!rawPhone || !otp) return res.status(400).json({ error: 'missing phone or otp' });

    // 阿里云国内短信要 11 位号码，去掉 +86。
    const phone = rawPhone.replace(/^\+86/, '').replace(/^\+/, '');

    await aliyunSendSms({ phone, code: otp });
    return res.status(200).json({});
  } catch (err) {
    console.error('sms-hook error:', err);
    // 返回 500 让 Supabase 把发送失败反馈给前端
    return res.status(500).json({ error: String(err.message || err) });
  }
};
