// fo-supabase.js — Supabase client wrapper
// ① Go to https://supabase.com → New Project
// ② Run supabase/schema.sql in the SQL Editor
// ③ Replace the two placeholders below with Project URL and anon key
//    (Settings → API → Project URL / Project API Keys)

const _SUPABASE_URL  = 'https://zdmhnwxwblpzcjgszqpj.supabase.co';
const _SUPABASE_KEY  = 'sb_publishable_43z5_LKA-Qht_xXGYTZxKQ_btF-rQGF';

const _configured = !_SUPABASE_URL.includes('YOUR_PROJECT');

if (_configured && typeof window.supabase !== 'undefined') {
  window._supabaseClient = window.supabase.createClient(_SUPABASE_URL, _SUPABASE_KEY);
}

window.FO_DB = {
  _c() { return window._supabaseClient || null; },

  // ── Auth ───────────────────────────────────────────────────────────────────

  async getSession() {
    const c = this._c(); if (!c) return null;
    const { data: { session } } = await c.auth.getSession();
    return session;
  },

  async signIn(email, password) {
    const c = this._c(); if (!c) throw new Error('未配置后端');
    const { data, error } = await c.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signUp(email, password, meta) {
    const c = this._c(); if (!c) throw new Error('未配置后端');
    const { data, error } = await c.auth.signUp({
      email,
      password,
      options: {
        data: meta,
        emailRedirectTo: window.location.origin + '/login.html'
      }
    });
    if (error) throw error;
    return data;
  },

  async resendVerification(email) {
    const c = this._c(); if (!c) throw new Error('未配置后端');
    const { error } = await c.auth.resend({ type: 'signup', email });
    if (error) throw error;
  },

  async signOut() {
    const c = this._c(); if (!c) return;
    await c.auth.signOut();
  },

  // ── Profiles ───────────────────────────────────────────────────────────────

  async getProfile(userId) {
    const c = this._c(); if (!c) return null;
    const { data, error } = await c.from('profiles').select('*').eq('id', userId).single();
    if (error) return null;
    return data;
  },

  async getAllProfiles() {
    const c = this._c(); if (!c) return [];
    const { data } = await c.from('profiles').select('*').order('created_at');
    return data || [];
  },

  // ── Invite codes ──────────────────────────────────────────────────────────

  async checkInviteCode(code) {
    const c = this._c(); if (!c) return true; // bypass when not configured
    const { data } = await c.rpc('check_invite_code', { p_code: code });
    return !!data;
  },

  async useInviteCode(code) {
    const c = this._c(); if (!c) return true;
    const { data } = await c.rpc('use_invite_code', { p_code: code });
    return !!data;
  },

  // ── Activity history ──────────────────────────────────────────────────────

  async logActivity(activityType, activityId, title) {
    const c = this._c(); if (!c) return;
    const session = await this.getSession();
    if (!session) return;
    await c.from('activity_history').insert({
      user_id: session.user.id,
      activity_type: activityType,
      activity_id: activityId,
      title
    });
  },

  async getActivityHistory(userId, limit) {
    const c = this._c(); if (!c) return [];
    const { data } = await c
      .from('activity_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit || 50);
    return data || [];
  },

  // ── Reading progress ──────────────────────────────────────────────────────

  async saveProgress(bookId, pagesRead, lastPage, completed) {
    const c = this._c(); if (!c) return;
    const session = await this.getSession();
    if (!session) return;
    await c.from('reading_progress').upsert({
      user_id:      session.user.id,
      book_id:      bookId,
      pages_read:   pagesRead,
      last_page:    lastPage,
      completed,
      last_read_at: new Date().toISOString()
    }, { onConflict: 'user_id,book_id' });
  },

  async getProgress(userId) {
    const c = this._c(); if (!c) return {};
    const { data } = await c.from('reading_progress').select('*').eq('user_id', userId);
    if (!data) return {};
    return Object.fromEntries(data.map(r => [r.book_id, r]));
  },

  // ── Diary ─────────────────────────────────────────────────────────────────

  async getDiaryEntries(limit) {
    const c = this._c(); if (!c) return [];
    const session = await this.getSession();
    if (!session) return [];
    const { data } = await c
      .from('diary_entries')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(limit || 50);
    return data || [];
  },

  async addDiaryEntry(content, mood) {
    const c = this._c(); if (!c) throw new Error('未配置后端');
    const session = await this.getSession();
    if (!session) throw new Error('请先登录');
    const { data, error } = await c
      .from('diary_entries')
      .insert({ user_id: session.user.id, content, mood })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteDiaryEntry(id) {
    const c = this._c(); if (!c) return;
    const session = await this.getSession();
    if (!session) return;
    await c.from('diary_entries').delete().eq('id', id).eq('user_id', session.user.id);
  },

  // ── Contributions ─────────────────────────────────────────────────────────────

  async addContribution({ type, target_id, field, old_value, new_value, summary, privacy }) {
    const c = this._c(); if (!c) throw new Error('未配置后端');
    const session = await this.getSession();
    if (!session) throw new Error('请先登录');
    const { data, error } = await c
      .from('contributions')
      .insert({
        author_id: session.user.id,
        type,
        target_id: target_id || null,
        field: field || null,
        old_value: old_value || null,
        new_value,
        summary: summary || null,
        privacy: privacy || 'family',
      })
      .select('*,author:profiles(name,family_role,avatar,color)')
      .single();
    if (error) throw error;
    return data;
  },

  async getContributions({ target_id, type, limit } = {}) {
    const c = this._c(); if (!c) return [];
    let q = c
      .from('contributions')
      .select('*,author:profiles(name,family_role,avatar,color)')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    if (target_id) q = q.eq('target_id', target_id);
    if (type) q = q.eq('type', type);
    q = q.limit(limit || 100);
    const { data } = await q;
    return data || [];
  },

  // ── Summer plan（暑假计划打卡，整份状态云同步）─────────────────────────────────

  async getSummerPlan() {
    const c = this._c(); if (!c) return null;
    const session = await this.getSession();
    if (!session) return null;
    const { data } = await c
      .from('summer_plan')
      .select('state')
      .eq('user_id', session.user.id)
      .single();
    return data ? data.state : null;
  },

  async saveSummerPlan(state) {
    const c = this._c(); if (!c) return;
    const session = await this.getSession();
    if (!session) return;
    await c.from('summer_plan').upsert({
      user_id:    session.user.id,
      state,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  },

  // ── Profile update ────────────────────────────────────────────────────────────

  async updateProfile({ name, family_role, role, avatar, color } = {}) {
    const c = this._c(); if (!c) throw new Error('未配置后端');
    const session = await this.getSession();
    if (!session) throw new Error('请先登录');
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (family_role !== undefined) updates.family_role = family_role;
    if (role !== undefined) updates.role = role;
    if (avatar !== undefined) updates.avatar = avatar;
    if (color !== undefined) updates.color = color;
    const { data, error } = await c
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  isConfigured() { return _configured; }
};
