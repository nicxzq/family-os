// mascot.js
// ─────────────────────────────────────────────────────────────────────
// 家庭角色系统 · Family Character System
//
// 用法（在故事页面里）：
//   <script src="../mascot.js"></script>
//   <family-character who="毛毛" pose="reading" size="160"></family-character>
//   <family-character who="小宝" pose="proud" size="200"></family-character>
//
// 内置角色：毛毛 (默认)、卡梅拉、爸爸、妈妈、大宝、小宝
// 可在 mascot-lab.html 里给每个成员上传头像；
// 头像数据存在 localStorage["family.roster"]，所有页面共享。
//
// 如果某成员有头像（image），渲染圆形照片 + 名字标签；
// 否则用毛毛 SVG 符号，按角色配色主题着色。
// ─────────────────────────────────────────────────────────────────────

(() => {
  if (window.__FAMILY_CHARACTER_LOADED) return;
  window.__FAMILY_CHARACTER_LOADED = true;

  // ─────────────────────────────────────────────────────────────────
  // 默认角色花名册
  // ─────────────────────────────────────────────────────────────────
  const DEFAULT_ROSTER = {
    "毛毛": {
      label: "毛毛",
      theme: {
        "--body-color":  "#FFFDF6",
        "--wing-color":  "#FBE39A",
        "--beak-color":  "#E56B5A",
        "--comb-color":  "transparent",
        "--accent-color":"#4B7BA8",
      },
      image: null,
    },
    "卡梅拉": {
      label: "卡梅拉",
      theme: {
        "--body-color":  "#FFFDF6",
        "--wing-color":  "#F4A799",
        "--beak-color":  "#E56B5A",
        "--comb-color":  "#E56B5A",
        "--accent-color":"#6FA86D",
      },
      image: null,
    },
    "爸爸": {
      label: "爸爸",
      theme: {
        "--body-color":  "#FFFDF6",
        "--wing-color":  "#A8C2DE",
        "--beak-color":  "#4B7BA8",
        "--comb-color":  "transparent",
        "--accent-color":"#E56B5A",
      },
      image: null,
    },
    "妈妈": {
      label: "妈妈",
      theme: {
        "--body-color":  "#FFFDF6",
        "--wing-color":  "#F4A799",
        "--beak-color":  "#E56B5A",
        "--comb-color":  "#E56B5A",
        "--accent-color":"#F4C13E",
      },
      image: null,
    },
    "大宝": {
      label: "大宝",
      theme: {
        "--body-color":  "#FFFDF6",
        "--wing-color":  "#6FA86D",
        "--beak-color":  "#E56B5A",
        "--comb-color":  "transparent",
        "--accent-color":"#F4C13E",
      },
      image: null,
    },
    "小宝": {
      label: "小宝",
      theme: {
        "--body-color":  "#FFFDF6",
        "--wing-color":  "#FBE39A",
        "--beak-color":  "#E56B5A",
        "--comb-color":  "transparent",
        "--accent-color":"#E56B5A",
      },
      image: null,
    },
  };

  const POSES = ["standing", "reading", "shy", "surprised", "proud", "thinking", "running", "sleeping"];

  // ─────────────────────────────────────────────────────────────────
  // 花名册存储 (localStorage)
  // ─────────────────────────────────────────────────────────────────
  const STORAGE_KEY = "family.roster";

  function loadRoster() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      // merge with defaults (defaults provide structure, saved provides overrides)
      const result = {};
      for (const [name, def] of Object.entries(DEFAULT_ROSTER)) {
        result[name] = { ...def, ...(saved[name] || {}) };
      }
      // also include any custom characters the user added
      for (const [name, val] of Object.entries(saved)) {
        if (!result[name]) result[name] = val;
      }
      return result;
    } catch (e) {
      return { ...DEFAULT_ROSTER };
    }
  }

  function saveRoster(roster) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(roster));
      window.dispatchEvent(new CustomEvent("family-roster-changed", { detail: roster }));
    } catch (e) {
      console.warn("Could not save roster", e);
    }
  }

  // public API
  window.FamilyRoster = {
    get: loadRoster,
    save: saveRoster,
    setMember(name, updates) {
      const r = loadRoster();
      r[name] = { ...(r[name] || DEFAULT_ROSTER["毛毛"]), ...updates };
      saveRoster(r);
    },
    reset() {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      window.dispatchEvent(new CustomEvent("family-roster-changed", { detail: loadRoster() }));
    },
    poses: POSES,
    defaults: DEFAULT_ROSTER,
  };

  // ─────────────────────────────────────────────────────────────────
  // 找到 mascot.svg 的路径（相对当前 HTML）
  // ─────────────────────────────────────────────────────────────────
  function findMascotPath() {
    // 优先使用页面上声明的 data-mascot-src
    const declared = document.querySelector("[data-mascot-src]");
    if (declared) return declared.dataset.mascotSrc;

    // 自动推测：mascot.js 同目录下
    const scripts = document.querySelectorAll("script[src]");
    for (const s of scripts) {
      const src = s.getAttribute("src");
      if (src && src.includes("mascot.js")) {
        return src.replace(/mascot\.js.*$/, "mascot.svg");
      }
    }
    return "mascot.svg";
  }

  const MASCOT_PATH = findMascotPath();

  // ─────────────────────────────────────────────────────────────────
  // Symbol 缓存
  // CSS 自定义属性（--wing-color 等）不会穿透 <use> 的 shadow 边界，
  // 所以我们把 mascot.svg 抓回来一次，缓存每个 symbol 的内部 SVG，
  // 渲染时直接 clone 进角色容器——这样 var() 沿正常 DOM 继承生效。
  // ─────────────────────────────────────────────────────────────────
  const SYMBOL_CACHE = {};         // poseId -> innerHTML string
  let symbolLoadPromise = null;    // 共享的加载 Promise
  const pendingRenders = new Set();

  function ingestSvgRoot(svgRoot) {
    if (!svgRoot) return;
    svgRoot.querySelectorAll("symbol[id^='maomao-']").forEach(sym => {
      const id = sym.id.replace(/^maomao-/, "");
      SYMBOL_CACHE[id] = sym.innerHTML;
    });
    // 把 <defs>（比如腮红渐变）也搬到一个全局可见的 svg 里
    const defs = svgRoot.querySelector("defs");
    if (defs && !document.getElementById("__mascot_global_defs")) {
      const holder = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      holder.id = "__mascot_global_defs";
      holder.setAttribute("width", "0");
      holder.setAttribute("height", "0");
      holder.style.position = "absolute";
      holder.style.overflow = "hidden";
      holder.appendChild(defs.cloneNode(true));
      document.body.appendChild(holder);
    }
  }

  function loadSymbols() {
    if (symbolLoadPromise) return symbolLoadPromise;

    // 1. 页面里已经内联了 mascot.svg？直接读
    const inline = document.querySelector("svg[data-mascot-inline], #__mascot_inline");
    if (inline) {
      ingestSvgRoot(inline);
    }
    // 也接受任何含 maomao-* symbol 的内联 svg
    if (Object.keys(SYMBOL_CACHE).length === 0) {
      document.querySelectorAll("svg").forEach(s => {
        if (s.querySelector("symbol[id^='maomao-']")) ingestSvgRoot(s);
      });
    }
    if (Object.keys(SYMBOL_CACHE).length > 0) {
      symbolLoadPromise = Promise.resolve();
      return symbolLoadPromise;
    }

    // 2. 否则 fetch
    symbolLoadPromise = fetch(MASCOT_PATH)
      .then(r => r.text())
      .then(text => {
        const doc = new DOMParser().parseFromString(text, "image/svg+xml");
        ingestSvgRoot(doc.documentElement);
      })
      .catch(e => {
        console.warn("[mascot] could not load", MASCOT_PATH, e);
      });
    return symbolLoadPromise;
  }

  // ─────────────────────────────────────────────────────────────────
  // <family-character> Web Component
  // ─────────────────────────────────────────────────────────────────
  class FamilyCharacter extends HTMLElement {
    static get observedAttributes() {
      return ["who", "pose", "size", "show-name"];
    }

    connectedCallback() {
      this._listener = () => this.render();
      window.addEventListener("family-roster-changed", this._listener);
      loadSymbols(); // 触发加载（已加载则秒返回）
      this.render();
    }
    disconnectedCallback() {
      window.removeEventListener("family-roster-changed", this._listener);
    }
    attributeChangedCallback() {
      if (this.isConnected) this.render();
    }

    render() {
      const who = this.getAttribute("who") || "毛毛";
      const pose = this.getAttribute("pose") || "standing";
      const size = parseInt(this.getAttribute("size") || "200", 10);
      const showName = this.hasAttribute("show-name");

      const roster = loadRoster();
      const member = roster[who] || roster["毛毛"];

      // 容器样式
      this.style.display = "inline-flex";
      this.style.flexDirection = "column";
      this.style.alignItems = "center";
      this.style.gap = "4px";

      // 清空
      this.innerHTML = "";

      const stage = document.createElement("div");
      stage.style.cssText = `
        width: ${size}px;
        height: ${size * 1.1}px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      // 应用主题色
      if (member.theme) {
        for (const [k, v] of Object.entries(member.theme)) {
          stage.style.setProperty(k, v);
        }
      }

      // 三种渲染模式：
      //   1. member.image + imageMode='drawing'  → 整张图当角色（孩子的画/手绘）
      //   2. member.image + imageMode='avatar'   → 圆形头像 + 毛毛翅膀脚（默认）
      //   3. 没有 image                          → 引用 mascot.svg 里的小鸡符号
      const imageMode = member.imageMode || "avatar";

      if (member.image && imageMode === "drawing") {
        // 全画模式：孩子画了一只新角色 / 上传了完整插画
        stage.innerHTML = `
          <svg viewBox="0 0 200 220" width="100%" height="100%">
            <ellipse cx="100" cy="205" rx="48" ry="6" fill="#2B2419" opacity="0.12"/>
            <image href="${member.image}" x="10" y="10" width="180" height="190"
              preserveAspectRatio="xMidYMax meet"/>
          </svg>
        `;
      } else if (member.image) {
        // 头像模式：圆形头像 + 小翅膀 + 小脚
        stage.innerHTML = `
          <svg viewBox="0 0 200 220" width="100%" height="100%" style="overflow: visible;">
            <defs>
              <clipPath id="ava-clip-${this._id || (this._id = Math.random().toString(36).slice(2,8))}">
                <circle cx="100" cy="100" r="62"/>
              </clipPath>
            </defs>
            <ellipse cx="40" cy="125" rx="14" ry="22"
              fill="var(--wing-color)" stroke="#2B2419" stroke-width="1.5"
              transform="rotate(-25 40 125)"/>
            <ellipse cx="160" cy="125" rx="14" ry="22"
              fill="var(--wing-color)" stroke="#2B2419" stroke-width="1.5"
              transform="rotate(25 160 125)"/>
            <circle cx="100" cy="100" r="64" fill="none" stroke="#2B2419" stroke-width="2"/>
            <image href="${member.image}" x="38" y="38" width="124" height="124"
              clip-path="url(#ava-clip-${this._id})" preserveAspectRatio="xMidYMid slice"/>
            <path d="M 88 178 L 84 192" stroke="var(--beak-color)" stroke-width="4" stroke-linecap="round" fill="none"/>
            <path d="M 112 178 L 116 192" stroke="var(--beak-color)" stroke-width="4" stroke-linecap="round" fill="none"/>
          </svg>
        `;
      } else {
        // 默认 SVG 角色模式：直接把 symbol 的内容 clone 进来
        // （不能用 <use>，因为 CSS 变量不穿透 shadow 边界）
        const inner = SYMBOL_CACHE[pose];
        if (inner) {
          stage.innerHTML = `
            <svg viewBox="0 0 200 220" width="100%" height="100%">
              ${inner}
            </svg>
          `;
        } else {
          // 还没加载完，先放个占位，加载完后会自动重渲染
          stage.innerHTML = `<svg viewBox="0 0 200 220" width="100%" height="100%"></svg>`;
          loadSymbols().then(() => {
            if (this.isConnected) this.render();
          });
        }
      }

      this.appendChild(stage);

      if (showName) {
        const label = document.createElement("div");
        label.textContent = member.label || who;
        label.style.cssText = `
          font-size: ${Math.max(12, size * 0.08)}px;
          color: #2B2419;
          font-family: "LXGW WenKai TC", serif;
        `;
        this.appendChild(label);
      }
    }
  }

  customElements.define("family-character", FamilyCharacter);
})();
