/**
 * ============================================
 * 桌宠文字避让功能 (pet-pretext-interaction.js)
 * 进阶版：支持标题、列表、表格和代码高亮块，且不破坏HTML结构
 * ============================================
 */

export class PetPretextInteraction {
  constructor(options = {}) {
    this.repelRadius = options.repelRadius || 50;
    this.throttleMs = options.throttleMs || 50;
    this.lastRun = 0;

    this.iframe = null;
    // 缓存区块及其内部的所有可移动字母，格式: { el: DOM节点, spans: [span1, span2...] }
    this.activeBlocks = [];
  }

  // 核心黑科技：深度遍历文本节点，不破坏任何原有 HTML 结构（如超链接、代码高亮颜色）
  wrapTextNodes(element, doc) {
    const spans = [];
    // 使用 TreeWalker 提取所有文本节点
    const walker = doc.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          // 跳过 script 和 style 标签里的内容
          const parentName = node.parentNode.nodeName;
          if (parentName === "SCRIPT" || parentName === "STYLE")
            return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      },
      false,
    );

    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    textNodes.forEach((textNode) => {
      const text = textNode.nodeValue;
      if (!text.trim()) return; // 纯换行或纯空格节点跳过，防止打乱排版

      const fragment = doc.createDocumentFragment();
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        // 如果是空格或换行，保持原样，不加特效（防止打乱代码块的缩进）
        if (char.trim() === "") {
          fragment.appendChild(doc.createTextNode(char));
        } else {
          const span = doc.createElement("span");
          span.textContent = char;
          // 行内块元素才能使用 transform，但我们不覆盖原本的高亮类名
          span.style.display = "inline-block";
          span.style.transition =
            "transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)";
          span.style.position = "relative";
          fragment.appendChild(span);
          spans.push(span); // 存入缓存组
        }
      }
      textNode.parentNode.replaceChild(fragment, textNode);
    });

    return spans;
  }

  prepareIframeText() {
    if (!this.iframe || !this.iframe.contentDocument) return;
    const doc = this.iframe.contentDocument;

    // 兼容多个文章内容选择器
    const articleBody = doc.querySelector(
      ".post-content, .article-content, .markdown-body, #article-container",
    );
    if (!articleBody) return;

    // 获取：段落、1-6级标题、列表、表格单元格、代码块
    // 故意排除了 .gutter (Hexo代码块的行号)，让行号保持静止，只让代码内容移动，效果更酷！
    const blocks = articleBody.querySelectorAll(
      "p, h1, h2, h3, h4, h5, h6, li, td:not(.gutter), th, pre",
    );

    if (blocks.length === 0) return;

    this.activeBlocks = [];

    blocks.forEach((block) => {
      // 避免重复处理，也避免处理嵌套元素（例如 td 里面如果有 p，只处理最外层）
      if (block.closest("[data-pretext-ready]")) return;

      const spans = this.wrapTextNodes(block, doc);
      if (spans.length > 0) {
        block.setAttribute("data-pretext-ready", "true");
        this.activeBlocks.push({
          el: block,
          spans: spans,
        });
      }
    });
  }

  update(petScreenX, petScreenY, timestamp) {
    if (!this.iframe) {
      this.iframe = document.querySelector(".article-modal-iframe");
    }
    if (!this.iframe) return;

    if (timestamp - this.lastRun < this.throttleMs) return;
    this.lastRun = timestamp;

    const modal = document.querySelector(".article-modal");
    if (!modal || !modal.classList.contains("active")) return;

    const doc = this.iframe.contentDocument;
    if (!doc) return;

    // 判断切文章：只要有缓存区块且不在 DOM 里，就清空
    if (
      this.activeBlocks.length > 0 &&
      !doc.contains(this.activeBlocks[0].el)
    ) {
      this.activeBlocks = [];
    }

    if (this.activeBlocks.length === 0) {
      this.prepareIframeText();
      return;
    }

    const iframeRect = this.iframe.getBoundingClientRect();

    // 离开文章区直接复原
    if (
      petScreenX < iframeRect.left ||
      petScreenX > iframeRect.right ||
      petScreenY < iframeRect.top ||
      petScreenY > iframeRect.bottom
    ) {
      this.resetText();
      return;
    }

    const petIframeX = petScreenX - iframeRect.left;
    const petIframeY =
      petScreenY - iframeRect.top + doc.documentElement.scrollTop;

    // 遍历区块
    this.activeBlocks.forEach((blockObj) => {
      const pRect = blockObj.el.getBoundingClientRect();
      const pTopAbsolute = pRect.top + doc.documentElement.scrollTop;
      const pBottomAbsolute = pRect.bottom + doc.documentElement.scrollTop;
      const margin = this.repelRadius + 100; // 上下缓冲阈值

      // 快速剔除：如果桌宠不在该区块的高度范围内，直接复位该区块的所有字母并跳过
      if (
        petIframeY < pTopAbsolute - margin ||
        petIframeY > pBottomAbsolute + margin
      ) {
        blockObj.spans.forEach((span) => {
          if (
            span.style.transform !== "translate(0px, 0px)" &&
            span.style.transform !== ""
          ) {
            span.style.transform = "translate(0px, 0px)";
            span.style.zIndex = "1";
          }
        });
        return;
      }

      // 如果在范围内，计算区块内部缓存的每一个字母
      blockObj.spans.forEach((span) => {
        const rect = span.getBoundingClientRect();
        const spanX = rect.left + rect.width / 2;
        const spanY =
          rect.top + doc.documentElement.scrollTop + rect.height / 2;

        const dx = spanX - petIframeX;
        const dy = spanY - petIframeY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.repelRadius) {
          const force = (this.repelRadius - distance) / this.repelRadius;
          const pushX = (dx / distance) * force * 15; // 限制最大推开 15px
          const pushY = (dy / distance) * force * 15;

          span.style.transform = `translate(${pushX}px, ${pushY}px)`;
          span.style.zIndex = "10";
        } else if (
          span.style.transform !== "translate(0px, 0px)" &&
          span.style.transform !== ""
        ) {
          span.style.transform = "translate(0px, 0px)";
          span.style.zIndex = "1";
        }
      });
    });
  }

  resetText() {
    this.activeBlocks.forEach((blockObj) => {
      blockObj.spans.forEach((span) => {
        if (
          span.style.transform !== "translate(0px, 0px)" &&
          span.style.transform !== ""
        ) {
          span.style.transform = "translate(0px, 0px)";
          span.style.zIndex = "1";
        }
      });
    });
  }
}
