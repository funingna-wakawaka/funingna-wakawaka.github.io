/**
 * ============================================
 * 模块5: 角色音效管理 (pet-sound.js)
 * ============================================
 *
 * · RUNNING 状态循环播放跑步音效
 * · 音调随机 0.75~1.0
 * ★ 鼠标右键点击角色弹出浮动菜单：
 *    - "静音" 按钮（切换静音/取消静音）
 *    - 音量滑块
 */

import { State } from "./pet-sprite.js";

const SC = {
  PITCH_MIN: 0.75,
  PITCH_MAX: 1.0,
  VOLUME: 0.3,
};

export class PetSound {
  /**
   * @param {string}      path      - 音效文件路径
   * @param {HTMLElement}  innerEl   - 角色内部容器（绑定右键事件）
   */
  constructor(path, innerEl) {
    this.audio = new Audio(path);
    this.audio.loop = true;
    this.audio.volume = SC.VOLUME;
    this.playing = false;
    this.unlocked = false;
    this.muted = false;
    this.volume = SC.VOLUME;

    // 右键菜单 DOM
    this.menuEl = null;
    this.innerEl = innerEl;

    // 监听首次交互解锁音频
    const unlock = () => {
      this.unlocked = true;
      document.removeEventListener("click", unlock);
      document.removeEventListener("touchstart", unlock);
      document.removeEventListener("mousedown", unlock);
    };
    document.addEventListener("click", unlock);
    document.addEventListener("touchstart", unlock);
    document.addEventListener("mousedown", unlock);

    // 创建右键菜单
    this._createMenu();
    this._bindContextMenu();
  }

  // ==================== 右键菜单 ====================

  /** 创建菜单 DOM */
  _createMenu() {
    const menu = document.createElement("div");
    menu.id = "pet-sound-menu";
    menu.style.cssText = `
      position: fixed;
      z-index: 999999;
      display: none;
      background: rgba(40, 40, 50, 0.95);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 8px;
      padding: 8px 10px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      backdrop-filter: blur(8px);
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      color: #eee;
      user-select: none;
      pointer-events: auto;
      min-width: 120px;
    `;

    // —— 静音按钮 ——
    const muteBtn = document.createElement("button");
    muteBtn.id = "pet-mute-btn";
    muteBtn.textContent = "🔊 静音";
    muteBtn.style.cssText = `
      display: block;
      width: 100%;
      padding: 4px 8px;
      margin-bottom: 6px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 4px;
      color: #eee;
      font-size: 12px;
      cursor: pointer;
      transition: background 0.2s;
    `;
    muteBtn.addEventListener("mouseenter", () => {
      muteBtn.style.background = "rgba(255,255,255,0.2)";
    });
    muteBtn.addEventListener("mouseleave", () => {
      muteBtn.style.background = "rgba(255,255,255,0.1)";
    });
    muteBtn.addEventListener("click", () => {
      this.muted = !this.muted;
      this.audio.muted = this.muted;
      muteBtn.textContent = this.muted ? "🔇 取消静音" : "🔊 静音";
    });

    // —— 音量标签 ——
    const volLabel = document.createElement("div");
    volLabel.style.cssText = `
      margin-bottom: 4px;
      font-size: 11px;
      color: #aaa;
    `;
    volLabel.textContent = "🏃 角色音效";

    // —— 音量滑块 ——
    const volSlider = document.createElement("input");
    volSlider.type = "range";
    volSlider.min = "0";
    volSlider.max = "100";
    volSlider.value = String(Math.round(this.volume * 100));
    volSlider.style.cssText = `
      display: block;
      width: 100%;
      height: 4px;
      cursor: pointer;
      accent-color: #7aa2f7;
      margin: 0;
    `;
    volSlider.addEventListener("input", () => {
      this.volume = parseInt(volSlider.value) / 100;
      this.audio.volume = this.volume;
    });

    // 组装
    menu.appendChild(muteBtn);
    menu.appendChild(volLabel);
    menu.appendChild(volSlider);

    document.body.appendChild(menu);
    this.menuEl = menu;
    this.muteBtn = muteBtn;

    // 点击其他区域关闭菜单
    document.addEventListener("mousedown", (e) => {
      if (!menu.contains(e.target)) {
        menu.style.display = "none";
      }
    });
  }

  /** 绑定右键事件到角色 */
  _bindContextMenu() {
    if (!this.innerEl) return;

    this.innerEl.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._showMenu(e.clientX, e.clientY);
    });
  }

  /** 在指定位置显示菜单 */
  _showMenu(x, y) {
    const menu = this.menuEl;
    if (!menu) return;

    menu.style.display = "block";

    // 确保菜单不超出屏幕
    const rect = menu.getBoundingClientRect();
    const mx = Math.min(x, window.innerWidth - rect.width - 10);
    const my = Math.min(y, window.innerHeight - rect.height - 10);

    menu.style.left = Math.max(0, mx) + "px";
    menu.style.top = Math.max(0, my) + "px";

    // 更新静音按钮文本
    this.muteBtn.textContent = this.muted ? "🔇 取消静音" : "🔊 静音";
  }

  // ==================== 播放控制 ====================

  /** 根据状态决定播放/停止 */
  update(state) {
    if (state === State.RUNNING) {
      this._play();
    } else {
      this._stop();
    }
  }

  _play() {
    if (this.playing || !this.unlocked) return;
    this.audio.playbackRate =
      SC.PITCH_MIN + Math.random() * (SC.PITCH_MAX - SC.PITCH_MIN);
    this.audio.currentTime = 0;
    this.audio.play().catch(() => {});
    this.playing = true;
  }

  _stop() {
    if (!this.playing) return;
    this.audio.pause();
    this.audio.currentTime = 0;
    this.playing = false;
  }

  /** 设置音量 0~1 */
  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    this.audio.volume = this.volume;
  }

  /** 销毁 */
  destroy() {
    this._stop();
    this.audio.src = "";
    if (this.menuEl && this.menuEl.parentNode) {
      this.menuEl.parentNode.removeChild(this.menuEl);
    }
  }
}
