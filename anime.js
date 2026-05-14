document.addEventListener("DOMContentLoaded", function () {
  // ==========================================
  // ★ 新增：全局解除防盗链 (绕过腾讯、B站等视频直链限制)
  // ==========================================
  let metaReferrer = document.querySelector('meta[name="referrer"]');
  if (!metaReferrer) {
    metaReferrer = document.createElement("meta");
    metaReferrer.name = "referrer";
    metaReferrer.content = "no-referrer";
    document.head.appendChild(metaReferrer);
  } else {
    metaReferrer.content = "no-referrer";
  }

  // === 1. 初始化配置与本地历史记录 ===
  const animeConfig =
    window.theme && window.theme.anime ? window.theme.anime : {};
  const isHistoryEnabled = animeConfig.history !== false;
  const globalApi = animeConfig.player_api || "";
  let art = null; // 替换为全局 Artplayer 实例

  // 提取 B站 BVID
  function extractBvid(url) {
    const match = url.match(/BV[a-zA-Z0-9]+/);
    return match ? match[0] : url;
  }

  // ★ 原生全屏事件监听修复
  document.addEventListener("fullscreenchange", function () {
    const sidebar = document.getElementById("anime-episode-sidebar");
    if (document.fullscreenElement) {
      // 原生全屏时，开启 fixed 模式，并挂载到全屏元素下
      sidebar.classList.add("fixed-fullscreen");
      document.fullscreenElement.appendChild(sidebar);
    } else {
      sidebar.classList.remove("fixed-fullscreen");
      document.querySelector(".anime-modal-body").appendChild(sidebar);
    }
  });

  // ★ 播放核心函数 (切换 iframe 或 Artplayer)
  function playVideo(rawUrl, apiOverride) {
    const api = apiOverride !== undefined ? apiOverride : globalApi;
    let finalUrl = rawUrl;

    if (api.includes("player.bilibili.com")) {
      const bvid = extractBvid(rawUrl);
      finalUrl = bvid.startsWith("BV")
        ? `${api}${bvid}&high_quality=1&danmaku=1`
        : rawUrl;
    } else {
      finalUrl = api ? `${api}${rawUrl}` : rawUrl;
    }

    const iframe = document.getElementById("anime-modal-iframe");
    const playerContainer = document.getElementById("anime-artplayer-container");
    const episodeSidebar = document.getElementById("anime-episode-sidebar");

    // ==========================================
    // ★ 新增拦截：阻止外部 blob 链接，给出友好提示
    // ==========================================
    if (finalUrl.startsWith("blob:")) {
      alert(
        "播放失败！\n\n检测到使用了 blob: 链接。\nBlob 链接是其他网站浏览器本地临时生成的，跨站无法访问，也无法抓取。\n\n请在配置中填写真实的直链(如 .m3u8) 或填写解析网页的 URL！",
      );
      iframe.style.display = "none";
      playerContainer.style.display = "none";
      return;
    }

    // 判断是不是直链视频
    const isDirectVideo =
      finalUrl.match(/\.(mp4|m3u8|flv|webm)($|\?)/i) ||
      finalUrl.includes("toutiao50.com") ||
      finalUrl.includes("/video/tos/");

    if (isDirectVideo) {
      // 直链视频：隐藏 iframe，使用 Artplayer
      iframe.style.display = "none";
      iframe.src = "";
      playerContainer.style.display = "block";

      const accentColor =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--accent-color")
          .trim() || "#ff6b6b";

      let customType = {};
      if (finalUrl.includes(".m3u8") || finalUrl.includes(".mp4") || finalUrl.includes("m3u8")) {
        customType.m3u8 = function (video, url, artInstance) {
          if (Hls.isSupported()) {
            if (artInstance.hls) artInstance.hls.destroy();
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
            artInstance.hls = hls;
            if (!artInstance.hlsDestroyBound) {
              artInstance.on("destroy", () => {
                if (artInstance.hls) artInstance.hls.destroy();
              });
              artInstance.hlsDestroyBound = true;
            }
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
          } else {
            artInstance.notice.show = "不支持的播放格式: m3u8";
          }
        };
      }

      // ★ 核心修复：如果不销毁已有实例直接 switchUrl，浏览器就能一直保持全屏状态
      if (art) {
        art.switchUrl(finalUrl);
      } else {
        art = new Artplayer({
          container: playerContainer,
          url: finalUrl,
          customType: customType,
          autoplay: true,
          theme: accentColor,
          volume: 0.5,
          isLive: false,
          muted: false,
          fullscreen: true,
          pip: false,
          playbackRate: true,
          setting: true,
          autoOrientation: true,
          lock: true,
          // ★ 在底部控制栏注入呼出选集按钮，方便全屏直接调用
          controls: [
            {
              position: "right",
              html: '<div style="display:flex;align-items:center;gap:4px;font-size:14px;padding:0 10px;cursor:pointer;"><i class="fas fa-list-ul"></i> 选集</div>',
              tooltip: "播放列表",
              click: function () {
                episodeSidebar.classList.toggle("show");
              },
            },
          ],
        });

        // ★ 视频播放结束自动切换下一集
        art.on("video:ended", function () {
          const activeBtn = document.querySelector(".episode-btn.active");
          if (
            activeBtn &&
            activeBtn.nextElementSibling &&
            activeBtn.nextElementSibling.classList.contains("episode-btn")
          ) {
            art.notice.show = "即将自动播放下一集...";
            setTimeout(() => {
              activeBtn.nextElementSibling.click();
            }, 1500);
          } else {
            art.notice.show = "没有了呢~";
          }
        });
      }
    } else {
      // 网页解析/B站外链：使用 iframe
      if (art) {
        // ★ 在销毁 art 实例之前，强制把侧边栏还原回默认容器，并取消 fixed 状态
        const safeBody = document.querySelector(".anime-modal-body");
        if (safeBody && episodeSidebar && episodeSidebar.parentNode !== safeBody) {
          episodeSidebar.classList.remove("fixed-fullscreen");
          safeBody.appendChild(episodeSidebar);
        }
        art.destroy(false);
        art = null;
      }
      playerContainer.style.display = "none";
      iframe.style.display = "block";
      iframe.src = finalUrl;
    }
  }

  // === 2. 观看历史记录逻辑 ===
  const HISTORY_KEY = "anime_watch_history";

  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveHistory(title) {
    if (!isHistoryEnabled) return;
    const history = getHistory();
    history[title] = new Date().getTime();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    updateBadges();
  }

  function updateBadges() {
    if (!isHistoryEnabled) return;
    const history = getHistory();
    document.querySelectorAll(".bili-card-wrapper").forEach((card) => {
      const title = card.getAttribute("data-title");
      const badge = card.querySelector(".watched-badge");
      if (history[title] && badge) badge.style.display = "block";
    });
  }

  updateBadges();

  // === 3. 获取所有需要的 DOM 元素 ===
  const modal = document.getElementById("anime-modal");
  const modalTitle = document.getElementById("anime-modal-title");
  const modalClose = document.getElementById("anime-modal-close");

  const episodeBtn = document.getElementById("anime-episode-btn");
  const episodeSidebar = document.getElementById("anime-episode-sidebar");
  const episodeList = document.getElementById("anime-episode-list");
  const sidebarCloseBtn = document.getElementById("sidebar-close-btn");
  const sourceSelect = document.getElementById("anime-source-select");

  const contextMenu = document.getElementById("anime-context-menu");
  const charactersContainer = document.getElementById(
    "context-menu-characters",
  );
  const loadingText = document.getElementById("context-menu-loading");

  // === 4. 绑定卡片交互事件 ===
  document.querySelectorAll(".bili-card-wrapper").forEach((card) => {
    card.addEventListener("click", function (e) {
      if (e.button !== 0) return;

      const title = this.getAttribute("data-title");
      const defaultUrl = this.getAttribute("data-url");

      let sources = JSON.parse(this.getAttribute("data-sources") || "[]");
      let rootEpisodes = JSON.parse(this.getAttribute("data-episodes") || "[]");

      if (sources.length === 0 && rootEpisodes.length > 0) {
        sources = [{ name: "默认源", episodes: rootEpisodes }];
      }

      saveHistory(title);
      contextMenu.classList.remove("show");
      modalTitle.textContent = title;

      if (sources.length > 0) {
        episodeBtn.style.display = "flex";

        sourceSelect.style.display = sources.length > 1 ? "block" : "none";
        sourceSelect.innerHTML = "";
        sources.forEach((src, idx) => {
          const opt = document.createElement("option");
          opt.value = idx;
          opt.textContent = src.name;
          sourceSelect.appendChild(opt);
        });

        function renderEpisodes(sourceIndex) {
          const currentSource = sources[sourceIndex];
          const eps = currentSource.episodes || [];
          episodeList.innerHTML = "";

          eps.forEach((ep, index) => {
            const btn = document.createElement("button");
            btn.className = "episode-btn";
            if (index === 0) btn.classList.add("active");
            btn.textContent = ep.title;

            btn.addEventListener("click", () => {
              document
                .querySelectorAll(".episode-btn")
                .forEach((b) => b.classList.remove("active"));
              btn.classList.add("active");
              playVideo(ep.url, currentSource.player_api);
            });
            episodeList.appendChild(btn);
          });
          
          if (eps.length > 0) {
            playVideo(eps[0].url, currentSource.player_api);
          }
        }

        sourceSelect.onchange = (e) => renderEpisodes(e.target.value);
        renderEpisodes(0);
      } else {
        episodeBtn.style.display = "none";
        sourceSelect.style.display = "none";
        playVideo(defaultUrl, globalApi);
      }

      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    });

    card.addEventListener("contextmenu", function (e) {
      e.preventDefault();
      const bangumiUrl = this.getAttribute("data-bangumi");
      charactersContainer.innerHTML = "";

      let x = e.clientX;
      let y = e.clientY;
      contextMenu.style.left = `${x}px`;
      contextMenu.style.top = `${y}px`;
      contextMenu.classList.add("show");

      const rect = contextMenu.getBoundingClientRect();
      if (x + rect.width > window.innerWidth)
        contextMenu.style.left = `${window.innerWidth - rect.width - 10}px`;
      if (y + rect.height > window.innerHeight)
        contextMenu.style.top = `${window.innerHeight - rect.height - 10}px`;

      if (!bangumiUrl) {
        charactersContainer.innerHTML =
          "<div style='grid-column: 1/-1; text-align:center; color:#888;'>未配置 bangumi_url</div>";
        return;
      }

      const subjectMatch = bangumiUrl.match(/\/subject\/(\d+)/);
      if (!subjectMatch) {
        charactersContainer.innerHTML =
          "<div style='grid-column: 1/-1; text-align:center; color:#888;'>无法解析 Bangumi ID</div>";
        return;
      }

      const subjectId = subjectMatch[1];
      loadingText.style.display = "inline";

      fetch(`https://api.bgm.tv/v0/subjects/${subjectId}/characters`)
        .then((res) => res.json())
        .then((data) => {
          loadingText.style.display = "none";
          if (!data || data.length === 0) {
            charactersContainer.innerHTML =
              "<div style='grid-column: 1/-1; text-align:center; color:#888;'>暂无角色信息</div>";
            return;
          }

          const topCharacters = data.slice(0, 30);
          topCharacters.forEach((char) => {
            const imgSrc =
              char.images && char.images.grid
                ? char.images.grid
                : "https://api.bgm.tv/v0/img/no_icon_subject.png";
            const item = document.createElement("div");
            item.className = "character-item";
            item.innerHTML = `
              <img class="character-avatar" src="${imgSrc}" alt="${char.name}" referrerpolicy="no-referrer">
              <span class="character-name" title="${char.name}">${char.name}</span>
            `;
            charactersContainer.appendChild(item);
          });
        })
        .catch((err) => {
          console.error(err);
          loadingText.style.display = "none";
          charactersContainer.innerHTML =
            "<div style='grid-column: 1/-1; text-align:center; color:#888;'>加载失败，请检查网络</div>";
        });
    });
  });

  // === 5. 模态框与侧边栏的控制逻辑 ===
  if (episodeBtn) {
    episodeBtn.addEventListener("click", () =>
      episodeSidebar.classList.toggle("show"),
    );
  }

  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener("click", () =>
      episodeSidebar.classList.remove("show"),
    );
  }

  function closeModal() {
    // 关闭时也确保节点回到安全位置
    const safeBody = document.querySelector(".anime-modal-body");
    const safeSidebar = document.getElementById("anime-episode-sidebar");
    if (safeBody && safeSidebar && safeSidebar.parentNode !== safeBody) {
      safeSidebar.classList.remove("fixed-fullscreen");
      safeBody.appendChild(safeSidebar);
    }

    modal.classList.remove("active");
    if (episodeSidebar) episodeSidebar.classList.remove("show");

    const iframe = document.getElementById("anime-modal-iframe");
    if (iframe) iframe.src = "";
    if (art) {
      art.destroy(false);
      art = null;
    }

    document.body.style.overflow = "";
  }

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener("click", function (e) {
    if (contextMenu && !contextMenu.contains(e.target)) {
      contextMenu.classList.remove("show");
    }
  });

  window.addEventListener(
    "scroll",
    function () {
      if (contextMenu && contextMenu.classList.contains("show")) {
        contextMenu.classList.remove("show");
      }
    },
    { passive: true },
  );
});