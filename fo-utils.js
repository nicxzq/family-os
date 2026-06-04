window.FO = {
  getMember() { return JSON.parse(localStorage.getItem('fo_member') || 'null'); },
  setMember(obj) { localStorage.setItem('fo_member', JSON.stringify(obj)); },
  getMembers() { return JSON.parse(localStorage.getItem('fo_members') || '[]'); },
  addMember(obj) {
    const arr = this.getMembers();
    arr.push(obj);
    localStorage.setItem('fo_members', JSON.stringify(arr));
  },
  updateMember(obj) {
    const arr = this.getMembers().map((m) => m.id === obj.id ? obj : m);
    localStorage.setItem('fo_members', JSON.stringify(arr));
    if (this.getMember()?.id === obj.id) this.setMember(obj);
  },
  getFamilyCode() { return localStorage.getItem('fo_family_code') || '1234'; },
  setFamilyCode(c) { localStorage.setItem('fo_family_code', c); },
  uuid() { return crypto.randomUUID(); },
  logHistory(bookId, title) {
    const m = this.getMember();
    if (!m) return;
    const hist = JSON.parse(localStorage.getItem('fo_history') || '[]');
    hist.unshift({ bookId, title, ts: Date.now(), memberId: m.id });
    localStorage.setItem('fo_history', JSON.stringify(hist.slice(0, 200)));
    if (typeof FO_DB !== 'undefined') FO_DB.logActivity('storybook', bookId, title).catch(() => {});
  },
  logGameHistory(gameId, title) {
    const m = this.getMember();
    if (!m) return;
    const hist = JSON.parse(localStorage.getItem('fo_history') || '[]');
    hist.unshift({ bookId: gameId, title, ts: Date.now(), memberId: m.id, type: 'game' });
    localStorage.setItem('fo_history', JSON.stringify(hist.slice(0, 200)));
    if (typeof FO_DB !== 'undefined') FO_DB.logActivity('game', gameId, title).catch(() => {});
  },
  logProgress(bookId, pageIdx, total) {
    const m = this.getMember();
    if (!m) return;
    const all = JSON.parse(localStorage.getItem('fo_progress') || '{}');
    if (!all[m.id]) all[m.id] = {};
    if (!all[m.id][bookId]) all[m.id][bookId] = { pages: [], completed: false, last: 0, lastTs: 0 };
    const rec = all[m.id][bookId];
    if (!rec.pages.includes(pageIdx)) rec.pages.push(pageIdx);
    rec.last = pageIdx;
    rec.completed = rec.pages.length >= total;
    rec.lastTs = Date.now();
    localStorage.setItem('fo_progress', JSON.stringify(all));
    if (typeof FO_DB !== 'undefined') {
      FO_DB.saveProgress(bookId, rec.pages, rec.last, rec.completed).catch(() => {});
    }
  },
  getProgress(memberId) {
    const all = JSON.parse(localStorage.getItem('fo_progress') || '{}');
    return all[memberId] || {};
  },
  getHistory(memberId, n) {
    n = n || 20;
    const hist = JSON.parse(localStorage.getItem('fo_history') || '[]');
    return hist.filter((h) => h.memberId === memberId).slice(0, n);
  },
  getPiggy(memberId) {
    const all = JSON.parse(localStorage.getItem('fo_piggy') || '{}');
    return all[memberId] || { balance: 0, entries: [], goals: [] };
  },
  setPiggy(memberId, obj) {
    const all = JSON.parse(localStorage.getItem('fo_piggy') || '{}');
    all[memberId] = obj;
    localStorage.setItem('fo_piggy', JSON.stringify(all));
  },
  formatTimeAgo(ts) {
    const diff = Date.now() - ts;
    const d = Math.floor(diff / 86400000);
    if (d === 0) return '今天';
    if (d === 1) return '昨天';
    if (d < 7) return d + '天前';
    if (d < 30) return Math.floor(d / 7) + '周前';
    return Math.floor(d / 30) + '个月前';
  },
  isWechat() {
    return /MicroMessenger/i.test(navigator.userAgent);
  },
  async syncFromSupabase() {
    if (typeof FO_DB === 'undefined' || !FO_DB.isConfigured()) return;
    try {
      const session = await FO_DB.getSession();
      if (!session) return;
      const profile = await FO_DB.getProfile(session.user.id);
      if (!profile) return;
      const m = {
        id: session.user.id,
        name: profile.name,
        avatar: profile.avatar,
        color: profile.color,
        role: profile.role,
        family_role: profile.family_role || '',
        joined: Date.now(),
      };
      FO.setMember(m);
      if (!FO.getMembers().find(x => x.id === m.id)) FO.addMember(m);
    } catch (e) { /* offline */ }
  },
  avatarSVG(avatar, color, size) {
    size = size || 40;
    const colors = { coral: '#E56B5A', blue: '#4B7BA8', green: '#6FA86D', yellow: '#F4C13E' };
    const bg = colors[color] || colors.coral;
    const shapes = {
      chick: `<ellipse cx="20" cy="22" rx="14" ry="13" fill="${bg}"/>
        <ellipse cx="20" cy="14" rx="9" ry="8" fill="${bg}"/>
        <ellipse cx="14" cy="22" rx="5" ry="3" fill="${bg}" transform="rotate(-20,14,22)"/>
        <ellipse cx="26" cy="22" rx="5" ry="3" fill="${bg}" transform="rotate(20,26,22)"/>
        <ellipse cx="20" cy="17" rx="3" ry="2" fill="#F4A799"/>
        <circle cx="17" cy="13" r="2" fill="#2B2419"/>
        <circle cx="23" cy="13" r="2" fill="#2B2419"/>`,
      dad: `<ellipse cx="20" cy="22" rx="14" ry="13" fill="${bg}"/>
        <ellipse cx="20" cy="13" rx="9" ry="8" fill="${bg}"/>
        <rect x="13" y="11" width="14" height="4" rx="2" fill="none" stroke="#2B2419" stroke-width="1.5"/>
        <ellipse cx="20" cy="16" rx="3" ry="2" fill="#F4A799"/>
        <circle cx="16" cy="12" r="1.5" fill="#2B2419"/>
        <circle cx="24" cy="12" r="1.5" fill="#2B2419"/>`,
      mom: `<ellipse cx="20" cy="22" rx="14" ry="13" fill="${bg}"/>
        <ellipse cx="20" cy="13" rx="9" ry="8" fill="${bg}"/>
        <path d="M16,7 Q20,4 24,7" fill="none" stroke="#E56B5A" stroke-width="2"/>
        <circle cx="20" cy="6" r="2" fill="#E56B5A"/>
        <ellipse cx="20" cy="16" rx="3" ry="2" fill="#F4A799"/>
        <circle cx="17" cy="12" r="2" fill="#2B2419"/>
        <circle cx="23" cy="12" r="2" fill="#2B2419"/>`,
      star: `<circle cx="20" cy="20" r="18" fill="${bg}"/>
        <path d="M20,7 l2.5,7.5 h7.9 l-6.4,4.6 2.5,7.5 -6.5-4.7 -6.5,4.7 2.5-7.5 -6.4-4.6 h7.9 z" fill="white"/>`
    };
    const shape = shapes[avatar] || shapes.chick;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="${size}" height="${size}">${shape}</svg>`;
  }
};
