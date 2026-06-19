/* fo-gate.js — page-level login guard for gated content.
   Include as the FIRST script in <head> so it runs before the body paints:
     <script src="/fo-gate.js"></script>
   If no family member is signed in, it redirects to the login page and
   remembers where to return via ?back=. Uses location.replace so the gated
   URL is not kept in history (prevents a back-button bypass loop). */
(function () {
  var signedIn = false;
  try {
    var m = JSON.parse(localStorage.getItem('fo_member') || 'null');
    signedIn = !!(m && m.id);
  } catch (e) { /* malformed storage -> treat as signed out */ }
  if (signedIn) return;
  var here = location.pathname + location.search + location.hash;
  location.replace('/login.html?back=' + encodeURIComponent(here));
})();
