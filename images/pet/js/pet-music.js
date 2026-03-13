/**
 * =====================================================
 * 模块8：音乐播放器（pet-music.js）
 * =====================================================
 * 作用：
 * - 播放外部音乐源（mp3/ogg 等）
 * - 提供基础功能：
 *   上一首 / 下一首 / 播放暂停 / 循环 / 音量（名称“音乐音量”）
 * - UI 会被挂载到 PetSound 的右键菜单里
 *
 * 说明：
 * - “自动获取封面”取决于音乐源是否提供封面信息。
 *   这里用 playlist 的 cover 字段作为封面 URL（最稳定）。
 * - 你后续给我音乐源，我可以帮你把 playlist 填进去。
 */

const MUSIC_CFG = {
  DEFAULT_VOLUME: 0.5,
};

export class PetMusicPlayer {
  /**
   * @param {object} opts
   * @param {Array<{title:string, url:string, cover?:string}>} opts.playlist
   */
  constructor(opts) {
    this.playlist = Array.isArray(opts.playlist) ? opts.playlist : [];
    this.index = 0;

    // 是否循环播放
    this.loop = true;

    // 音频对象
    this.audio = new Audio();
    this.audio.volume = MUSIC_CFG.DEFAULT_VOLUME;
    this.audio.preload = "none";

    // 播放结束：若循环则自动下一首
    this.audio.addEventListener("ended", () => {
      if (this.loop) this.next(true);
    });

    // UI 元素引用（挂载后才会有）
    this.coverBtn = null;
    this.titleEl = null;
    this.playBtn = null;
    this.loopBtn = null;

    // 如果有歌单，先加载第一首
    if (this.playlist.length > 0) this._load(0);
  }

  /** 当前曲目对象 */
  _current() {
    return this.playlist[this.index] || null;
  }

  /** 加载指定索引曲目 */
  _load(i) {
    if (this.playlist.length === 0) return;

    // 取模确保不会越界
    this.index = (i + this.playlist.length) % this.playlist.length;

    const t = this._current();
    this.audio.src = t.url;

    this._syncUI();
  }

  /**
   * 同步 UI：
   * - 封面按钮背景图
   * - 标题显示
   * - 播放按钮图标
   * - 循环按钮图标
   */
  _syncUI() {
    const t = this._current();
    if (!t) return;

    if (this.titleEl) this.titleEl.textContent = t.title || "未命名歌曲";

    if (this.coverBtn) {
      const cover = t.cover || "";
      this.coverBtn.style.backgroundImage = cover ? `url('${cover}')` : "none";
      this.coverBtn.textContent = cover ? "" : "♪";
    }

    if (this.playBtn) this.playBtn.textContent = this.audio.paused ? "▶" : "⏸";
    if (this.loopBtn) this.loopBtn.textContent = this.loop ? "🔁" : "➡";
  }

  /** 播放 / 暂停 */
  playPause() {
    if (this.playlist.length === 0) return;

    if (this.audio.paused) {
      this.audio.play().catch(() => {});
    } else {
      this.audio.pause();
    }
    this._syncUI();
  }

  /** 上一首 */
  prev(autoPlay = false) {
    if (this.playlist.length === 0) return;
    this._load(this.index - 1);
    if (autoPlay) this.audio.play().catch(() => {});
    this._syncUI();
  }

  /** 下一首 */
  next(autoPlay = false) {
    if (this.playlist.length === 0) return;
    this._load(this.index + 1);
    if (autoPlay) this.audio.play().catch(() => {});
    this._syncUI();
  }

  /** 切换循环 */
  toggleLoop() {
    this.loop = !this.loop;
    this._syncUI();
  }

  /** 设置音乐音量（0~1） */
  setVolume(v01) {
    this.audio.volume = Math.max(0, Math.min(1, v01));
  }

  /**
   * 把音乐播放器 UI 挂载到右键菜单里
   * @param {HTMLElement} menuEl
   */
  mountToMenu(menuEl) {
    // 外层容器（与“角色音效”区域分隔开）
    const wrap = document.createElement("div");
    wrap.style.cssText = `
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid rgba(255,255,255,0.12);
    `;

    // 顶部：封面圆形按钮 + 歌名
    const head = document.createElement("div");
    head.style.cssText = `display:flex; align-items:center; gap:8px; margin-bottom:8px;`;

    // 封面按钮：点击切换到下一首
    const coverBtn = document.createElement("button");
    coverBtn.title = "切换音乐（下一首）";
    coverBtn.style.cssText = `
      width: 34px; height: 34px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.08);
      background-size: cover;
      background-position: center;
      color: #fff;
      cursor: pointer;
      flex: 0 0 auto;
    `;
    coverBtn.addEventListener("click", () => this.next(true));

    // 标题
    const title = document.createElement("div");
    title.style.cssText = `
      font-size: 11px;
      color: rgba(255,255,255,0.85);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 160px;
    `;
    title.textContent = "未加载音乐";

    head.appendChild(coverBtn);
    head.appendChild(title);

    // 控制按钮行
    const controls = document.createElement("div");
    controls.style.cssText = `display:flex; align-items:center; gap:8px;`;

    // 统一按钮样式
    const btnStyle = `
      width: 28px; height: 28px;
      border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.16);
      background: rgba(255,255,255,0.08);
      color: #eee;
      cursor: pointer;
    `;

    const prevBtn = document.createElement("button");
    prevBtn.style.cssText = btnStyle;
    prevBtn.textContent = "⏮";
    prevBtn.title = "上一首";
    prevBtn.addEventListener("click", () => this.prev(true));

    const playBtn = document.createElement("button");
    playBtn.style.cssText = btnStyle;
    playBtn.textContent = "▶";
    playBtn.title = "播放/暂停";
    playBtn.addEventListener("click", () => this.playPause());

    const nextBtn = document.createElement("button");
    nextBtn.style.cssText = btnStyle;
    nextBtn.textContent = "⏭";
    nextBtn.title = "下一首";
    nextBtn.addEventListener("click", () => this.next(true));

    const loopBtn = document.createElement("button");
    loopBtn.style.cssText = btnStyle;
    loopBtn.textContent = "🔁";
    loopBtn.title = "循环播放";
    loopBtn.addEventListener("click", () => this.toggleLoop());

    controls.appendChild(prevBtn);
    controls.appendChild(playBtn);
    controls.appendChild(nextBtn);
    controls.appendChild(loopBtn);

    // 音量（名称明确为“音乐音量”）
    const volLabel = document.createElement("div");
    volLabel.style.cssText = `margin-top:8px; margin-bottom:4px; font-size: 11px; color:#aaa;`;
    volLabel.textContent = "🎵 音乐音量";

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "0";
    slider.max = "100";
    slider.value = String(Math.round(this.audio.volume * 100));
    slider.style.cssText = `
      display:block;
      width:100%;
      height:4px;
      cursor:pointer;
      accent-color:#7aa2f7;
      margin:0;
    `;
    slider.addEventListener("input", () =>
      this.setVolume(parseInt(slider.value, 10) / 100),
    );

    wrap.appendChild(head);
    wrap.appendChild(controls);
    wrap.appendChild(volLabel);
    wrap.appendChild(slider);

    // 将音乐播放器挂载到右键菜单的最顶部（在静音按钮上方）
    menuEl.insertBefore(wrap, menuEl.firstChild);

    // 保存引用用于同步 UI
    this.coverBtn = coverBtn;
    this.titleEl = title;
    this.playBtn = playBtn;
    this.loopBtn = loopBtn;

    // 初次同步 UI
    this._syncUI();
  }
}
