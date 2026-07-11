window.AICampData = (function () {
  const tasks = [
    { id: 'E1', phase: 'explore', phaseTitle: '探索者实验室', title: '咒语对决', summary: '同一想法写两版，让 AI 真正听懂。', evidence: '两版提示和一句“第二版为什么更准”。', color: 'green' },
    { id: 'E2', phase: 'explore', phaseTitle: '探索者实验室', title: '游戏旋钮', summary: '先猜再改，找到三个可调参数。', evidence: '三个“我原来猜……结果……”记录。', color: 'green' },
    { id: 'E3', phase: 'explore', phaseTitle: '探索者实验室', title: '乐高机关挑战', summary: '把一个机关讲成可以执行的规则。', evidence: '机关照片或草图，以及三步规则。', color: 'green' },
    { id: 'E4', phase: 'explore', phaseTitle: '探索者实验室', title: '画出来的角色', summary: '画角色，也练习做自己的取舍。', evidence: '角色卡和一个没有采用 AI 建议的理由。', color: 'green' },
    { id: 'E5', phase: 'explore', phaseTitle: '探索者实验室', title: '科学实验侦探', summary: '先猜，再只动一个变量，看证据。', evidence: '猜想、观察和自己的解释。', color: 'green' },
    { id: 'E6', phase: 'explore', phaseTitle: '探索者实验室', title: '灵感选品会', summary: '选出真正想继续做的方向。', evidence: '想法榜、两个候选和选择理由。', color: 'green' },
    { id: 'G1', phase: 'game', phaseTitle: '游戏改造厂', title: '改造任务书', summary: '决定先改什么、给谁玩、怎么算好。', evidence: '一页需求卡和改造前截图。', color: 'blue' },
    { id: 'G2', phase: 'game', phaseTitle: '游戏改造厂', title: '纸面升级', summary: '先让爸爸在纸上试玩一次。', evidence: '纸面草图和至少一个发现的漏洞。', color: 'blue' },
    { id: 'G3', phase: 'game', phaseTitle: '游戏改造厂', title: '视觉换装', summary: '做一次看得见的前后变化。', evidence: '改造前后截图和取舍说明。', color: 'blue' },
    { id: 'G4', phase: 'game', phaseTitle: '游戏改造厂', title: '手感实验', summary: '找到自己觉得最爽的参数。', evidence: '三个参数试验记录和最终选择。', color: 'blue' },
    { id: 'G5', phase: 'game', phaseTitle: '游戏改造厂', title: '核心功能', summary: '加一个真正改变玩法的功能。', evidence: 'v0.x 版本和给家人的讲解。', color: 'blue' },
    { id: 'G6', phase: 'game', phaseTitle: '游戏改造厂', title: '内测与发布', summary: '听三个人真话，只修最重要一条。', evidence: '三张反馈、选择理由和 v1.0。', color: 'blue' },
    { id: 'L1', phase: 'learn', phaseTitle: '学习冒险伙伴', title: '学习麻烦观察', summary: '找一个自己真想解决的学习麻烦。', evidence: '问题观察卡，写清真实发生的场景。', color: 'coral' },
    { id: 'L2', phase: 'learn', phaseTitle: '学习冒险伙伴', title: '学习冒险蓝图', summary: '把练习改成有玩法的挑战。', evidence: '产品计划书和三个必备功能。', color: 'coral' },
    { id: 'L3', phase: 'learn', phaseTitle: '学习冒险伙伴', title: '纸面试玩', summary: '不解释，观察玩家怎么走。', evidence: '纸面原型和一个试玩发现。', color: 'coral' },
    { id: 'L4', phase: 'learn', phaseTitle: '学习冒险伙伴', title: 'MVP v0.1', summary: '先做最小能玩的版本。', evidence: '可玩的 v0.1 和保存版本。', color: 'coral' },
    { id: 'L5', phase: 'learn', phaseTitle: '学习冒险伙伴', title: '功能冲刺与内测', summary: '请三个人用，记录他们的反应。', evidence: '内测表、版本记录和待改清单。', color: 'coral' },
    { id: 'L6', phase: 'learn', phaseTitle: '学习冒险伙伴', title: '迭代与毕业发布', summary: '改一版，讲清它为什么有用。', evidence: '毕业演示和给寒假自己的信。', color: 'coral' }
  ];

  function defaultState() {
    return {
      version: 1,
      tasks: {},
      ideas: [],
      project: { name: '', audience: '', problem: '', corePlay: '', musts: '', wishes: '' },
      logs: [],
      feedback: [],
      weekly: [],
      settings: { guardianName: '' }
    };
  }

  return { tasks: tasks, defaultState: defaultState };
}());
