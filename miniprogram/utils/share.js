// 全页面分享用的纯函数（R2）：统一 title/path/query 的组装方式，方便各页面复用。
function buildShare(title, path) {
  return { title: title, path: path };
}

function buildTimeline(title, query) {
  return { title: title, query: query || '' };
}

module.exports = { buildShare: buildShare, buildTimeline: buildTimeline };
