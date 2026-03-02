// 分享功能处理 (修复域名丢失 + 正确区分QQ/微信分享逻辑)
document.addEventListener("DOMContentLoaded", function () {
  // 1. 辅助翻译函数
  function t(text) {
    if (window.i18n && typeof window.i18n.get === "function") {
      return window.i18n.get(text);
    }
    return text;
  }

  // 2. ★★★ 核心修复：获取当前页面绝对完整的 URL ★★★
  // 不再依赖 data- 属性拼接，直接取浏览器地址栏，保证 100% 正确
  function getCurrentUrl() {
    // 比如：https://mysite.com/2026/01/28/article/
    // split('#')[0] 是为了去掉 url 末尾可能的 #锚点
    return window.location.href.split("#")[0];
  }

  // 获取页面元数据 (用于 QQ/微博 自动抓取标题和图片)
  function getPageMetadata() {
    return {
      url: getCurrentUrl(),
      title: document.title,
      // 获取文章里的第一张图作为缩略图，如果没有就为空
      pic: (document.querySelector(".article-content img") || {}).src || "",
    };
  }

  // ================= 3. 复制链接功能 =================
  const copyButtons = document.querySelectorAll(".share-btn.copy");
  copyButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const finalUrl = getCurrentUrl();

      // 现代浏览器复制
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard
          .writeText(finalUrl)
          .then(() => showCopySuccess(this))
          .catch(() => fallbackCopy(finalUrl, this));
      } else {
        // 旧版兼容
        fallbackCopy(finalUrl, this);
      }
    });
  });

  // 复制的回退方案
  function fallbackCopy(text, button) {
    const tempInput = document.createElement("input");
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand("copy");
      showCopySuccess(button);
    } catch (err) {
      console.error("Copy failed", err);
    }
    document.body.removeChild(tempInput);
  }

  // 显示"已复制"提示
  function showCopySuccess(button) {
    const span = button.querySelector("span");
    if (span) {
      const originalText = span.textContent;
      span.textContent = t("已复制!");
      setTimeout(() => {
        span.textContent = originalText;
      }, 2000);
    }
  }

  // ================= 4. QQ / 微博 / 豆瓣 直接跳转分享 =================
  const directShareButtons = document.querySelectorAll(
    ".share-btn.qq, .share-btn.weibo, .share-btn.douban",
  );

  directShareButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();

      // 1. 获取完整链接
      const fullUrl = window.location.href.split("#")[0];
      const title = document.title;
      // 尝试获取文章摘要
      const descMeta = document.querySelector('meta[name="description"]');
      const summary = descMeta ? descMeta.content : "";
      // 获取图片
      const pic =
        (document.querySelector(".article-content img") || {}).src || "";

      // ★★★ 关键提示：如果你在本地 localhost 测试，QQ 分享是 100% 无法成功的 ★★★
      // 必须部署到公网 (https://www.xxx.com) 才能正常使用
      if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      ) {
        alert("QQ分享功能必须在网站发布到公网后才能使用，本地测试无法跳转。");
        return;
      }

      let targetUrl = "";

      if (this.classList.contains("qq")) {
        // ★★★ 方案 B：使用 QZone 接口 (最稳定) ★★★
        // 这个接口比 connect.qq.com 稳定得多，不会跳 0.0.7.234
        // 它的参数是：url, title, pics, summary
        targetUrl = `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${encodeURIComponent(fullUrl)}&title=${encodeURIComponent(title)}&pics=${encodeURIComponent(pic)}&summary=${encodeURIComponent(summary)}`;
      } else if (this.classList.contains("weibo")) {
        // 微博
        targetUrl = `http://service.weibo.com/share/share.php?url=${encodeURIComponent(fullUrl)}&title=${encodeURIComponent(title)}&pic=${encodeURIComponent(pic)}`;
      } else if (this.classList.contains("douban")) {
        // 豆瓣
        targetUrl = `https://www.douban.com/share/service?href=${encodeURIComponent(fullUrl)}&name=${encodeURIComponent(title)}&image=${encodeURIComponent(pic)}`;
      }

      // 打开新窗口
      if (targetUrl) {
        window.open(
          targetUrl,
          "_blank",
          "width=800,height=600,top=100,left=100",
        );
      }
    });
  });

  // ================= 5. 微信分享功能 (保留二维码，生成纯净链接) =================
  const wechatButtons = document.querySelectorAll(".share-btn.wechat");

  function closeWechatModal() {
    const existingModal = document.querySelector(".wechat-share-modal");
    if (existingModal) {
      existingModal.remove();
      document.removeEventListener("click", handleGlobalClick);
      document.removeEventListener("keydown", handleEscKey);
    }
  }

  function handleGlobalClick(event) {
    const modal = document.querySelector(".wechat-share-modal");
    if (!modal) return;
    const container = modal.querySelector(".wechat-share-container");
    if (
      event.target.closest(".wechat-share-close") ||
      (container && !container.contains(event.target))
    ) {
      closeWechatModal();
    }
  }

  function handleEscKey(event) {
    if (event.key === "Escape") closeWechatModal();
  }

  wechatButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeWechatModal();

      // ★★★ 关键：二维码内容只放纯净的 URL，不要加任何 API 前缀 ★★★
      const url = getCurrentUrl();

      const modal = document.createElement("div");
      modal.className = "wechat-share-modal";

      const titleText = t("微信扫一扫分享");
      const descText = t(
        '打开微信，点击底部的"发现"，使用"扫一扫"即可将网页分享至朋友圈。',
      );

      modal.innerHTML = `
        <div class="wechat-share-container">
          <div class="wechat-share-header">
            <h3>${titleText}</h3>
            <button class="wechat-share-close" type="button">&times;</button>
          </div>
          <div class="wechat-share-body">
            <div id="wechat-qrcode"></div>
            <p>${descText}</p>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      setTimeout(() => {
        const qrContainer = modal.querySelector("#wechat-qrcode");
        if (qrContainer) {
          qrContainer.innerHTML = "";

          if (typeof QRCode !== "undefined") {
            try {
              new QRCode(qrContainer, {
                text: url, // 这里传入的是 https://mysite.com/article/
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H,
              });
            } catch (error) {
              useApiFallback(qrContainer, url);
            }
          } else {
            useApiFallback(qrContainer, url);
          }
        }
      }, 50);

      setTimeout(() => {
        document.addEventListener("click", handleGlobalClick);
        document.addEventListener("keydown", handleEscKey);
      }, 100);
    });
  });

  function useApiFallback(container, url) {
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    const img = new Image();
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.onload = function () {
      container.innerHTML = "";
      container.appendChild(img);
    };
    img.src = apiUrl;
  }
});
