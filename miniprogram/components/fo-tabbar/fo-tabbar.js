// 详情页底部常驻 tab 栏：navigateTo 页面没有原生 tabBar，用本组件补齐，
// 保证任何内容页都能一键回到四个 tab（样式与 app.json tabBar 一致）。
const TABS = [
  { key: 'home', text: '首页', url: '/pages/home/home' },
  { key: 'role', text: '角色', url: '/pages/role/role' },
  { key: 'toolbox', text: '工具箱', url: '/pages/toolbox/toolbox' },
  { key: 'mine', text: '我的', url: '/pages/mine/mine' }
];

Component({
  properties: {
    // 当前详情页归属的 tab，高亮显示
    active: { type: String, value: '' }
  },
  data: {
    tabs: TABS
  },
  methods: {
    onTab(e) {
      wx.switchTab({ url: e.currentTarget.dataset.url });
    }
  }
});
