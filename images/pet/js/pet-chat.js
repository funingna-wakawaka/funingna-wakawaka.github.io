/**
 * ============================================
 * 模块7: 角色聊天气泡 (pet-chat.js)
 * ============================================
 */
import { State } from "./pet-sprite.js";

export class PetChat {
  constructor(bubbleEl, textEl, innerEl) {
    this.bubbleEl = bubbleEl;
    this.textEl = textEl;
    this.innerEl = innerEl;

    this.idleTime = 0;
    this.bubbleTimer = null;
    this.isSpeaking = false;
    this.lastState = State.IDLE;

    this.dialogues = {
      drag: ["放开我!!!", "救命啊!!!", "我讨厌你~呜呜"],
      click: ["不要老是戳我呀"],
      rightClick: ["不要右键点我听到没有"],
      fall: ["哼", "哎呀"],
      idle: [
        "你怎么不理我了",
        "快点和我说话",
        "我好无聊啊",
        "老师我想听歌",
        "我好困啊",
        "可以放首歌吗我想听歌!!!",
      ],
    };

    this._bindEvents();
  }

  _bindEvents() {
    this.innerEl.addEventListener("click", () => {
      this.idleTime = 0;
      this.say(this._random(this.dialogues.click));
    });

    this.innerEl.addEventListener("contextmenu", () => {
      this.idleTime = 0;
      this.say(this._random(this.dialogues.rightClick));
    });
  }

  // 【去掉翻转逻辑】直接检测状态即可
  update(dt, currentState) {
    if (this.lastState !== currentState) {
      if (currentState === State.DRAGGING) {
        this.say(this._random(this.dialogues.drag));
      } else if (currentState === State.FALL) {
        this.say(this._random(this.dialogues.fall));
      }
      this.lastState = currentState;
    }

    this.idleTime += dt;
    if (this.idleTime >= 60) {
      this.idleTime = 0;
      this.say(this._random(this.dialogues.idle));
    }
  }

  say(text, duration = 3000) {
    if (!this.bubbleEl || !this.textEl) return;

    this.textEl.textContent = text;
    this.bubbleEl.style.display = "block";
    this.bubbleEl.style.opacity = "1";
    this.isSpeaking = true;

    clearTimeout(this.bubbleTimer);
    this.bubbleTimer = setTimeout(() => {
      this.bubbleEl.style.opacity = "0";
      setTimeout(() => {
        this.bubbleEl.style.display = "none";
        this.isSpeaking = false;
      }, 300);
    }, duration);
  }

  _random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
