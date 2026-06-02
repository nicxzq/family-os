// family-changelog.js
// 家庭修订日志。privacy:"public" 才在主页渲染；"family" 仅本地/私密区留存。
// 格式: { date, who, change, privacy, ideaId? }
//   ideaId: 对应 .idea[data-idea-id] 的值，有此字段时作为该想法卡的"反对/修订"显示

const FAMILY_CHANGELOG = [
  {
    date: '2026-05',
    who: '爸爸',
    change: '建立家庭操作系统 v1，写下六条核心想法，发给家里每个人。',
    privacy: 'public',
  },
  {
    date: '2026-06',
    who: '爸爸',
    change: 'v2 隐私升级：去掉所有公开页的精确年龄；给孩子直发页加搜索屏蔽；把"这家里没有批评教育"改成了留余地的版本——因为大人有时候确实会忍不住。',
    privacy: 'public',
  },
];

// 反对/修订意见示例（ideaId 对应 idea 卡的 data-idea-id）
// 在 FAMILY_CHANGELOG 里追加此类条目即可让对应卡片显示"已有意见"标记
//
// 示例（取消注释后生效）：
// {
//   date: '2026-07',
//   who: '哥哥',
//   change: '我觉得"非必要不竞争"有点绝对——有些事就是要争，争才能知道自己的边界在哪。',
//   privacy: 'public',
//   ideaId: 'time',
// },
