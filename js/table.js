/**
 * table.js — Table enhancement: collapse, horizontal scroll, fullscreen viewer.
 *
 * • Tables with more than TABLE_COLLAPSE_ROWS rows get a fade + "展开表格" toggle.
 * • ALL tables get horizontal scroll via mouse-wheel (vertical delta → horizontal).
 * • Fullscreen viewer is self-contained (no external dependency).
 * • Copy button copies the full table as HTML (with TSV fallback).
 */

(function () {
  "use strict";

  var TABLE_COLLAPSE_ROWS = 8;
  var WHEEL_MULTIPLIER = 3; // speed-up factor for horizontal wheel scroll

  /* ── Icons ─────────────────────────────────────────────────────────── */
  var I_FULLSCREEN =
    '<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>';
  var I_COPY =
    '<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';
  var I_ZOOM_IN =
    '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm.5-7H9v2H7v1h2v2h1v-2h2V9h-2z"/></svg>';
  var I_ZOOM_OUT =
    '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z"/></svg>';
  var I_ZOOM_RESET =
    '<svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>';

  /* ── Copy table as HTML (fallback: TSV) ─────────────────────────────── */
  function copyTable(table, noticeEl) {
    var html = table.outerHTML;
    var tsv = tableToTsv(table);

    function flash() {
      if (!noticeEl) return;
      noticeEl.style.opacity = "1";
      setTimeout(function () {
        noticeEl.style.opacity = "0";
      }, 1500);
    }

    // Try writing both text/html and text/plain via ClipboardItem
    if (
      typeof ClipboardItem !== "undefined" &&
      navigator.clipboard &&
      navigator.clipboard.write
    ) {
      try {
        var item = new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([tsv], { type: "text/plain" }),
        });
        navigator.clipboard
          .write([item])
          .then(flash)
          .catch(function () {
            // ClipboardItem write failed — fall through to plain text
            navigator.clipboard.writeText(tsv).then(flash).catch(flash);
          });
        return;
      } catch (e) {
        /* ClipboardItem constructor can throw in some browsers */
      }
    }

    // Fallback: plain text (TSV)
    if (navigator.clipboard) {
      navigator.clipboard.writeText(tsv).then(flash).catch(flash);
    } else {
      var ta = document.createElement("textarea");
      ta.value = tsv;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch (e) {}
      ta.remove();
      flash();
    }
  }

  /* ── Convert table → TSV (fallback for copy) ────────────────────────── */
  function tableToTsv(table) {
    return Array.from(table.querySelectorAll("tr"))
      .map(function (tr) {
        return Array.from(tr.querySelectorAll("th,td"))
          .map(function (td) {
            return (td.innerText || td.textContent).replace(/\t/g, " ").trim();
          })
          .join("\t");
      })
      .join("\n");
  }

  /* ── Horizontal scroll via vertical mouse-wheel ─────────────────────── */
  function attachHScroll(scrollEl) {
    scrollEl.addEventListener(
      "wheel",
      function (e) {
        if (e.shiftKey) return;
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        var isScrollable = this.scrollWidth > this.clientWidth;
        if (!isScrollable) return;
        var delta = e.deltaY * WHEEL_MULTIPLIER;
        var atLeft = this.scrollLeft <= 0;
        var atRight =
          Math.ceil(this.scrollLeft + this.clientWidth) >= this.scrollWidth;
        if (delta > 0 && !atRight) {
          e.preventDefault();
          this.scrollLeft += delta;
        } else if (delta < 0 && !atLeft) {
          e.preventDefault();
          this.scrollLeft += delta;
        }
      },
      { passive: false },
    );
  }

  /* ── Self-contained fullscreen viewer ──────────────────────────────── */
  var viewer = null;

  function getViewer() {
    if (viewer) return viewer;

    var overlay = document.createElement("div");
    overlay.className = "table-viewer";

    var stage = document.createElement("div");
    stage.className = "table-viewer-stage";

    var closeBtn = document.createElement("div");
    closeBtn.className = "table-viewer-close";
    closeBtn.innerHTML = "&times;";

    var toolbar = document.createElement("div");
    toolbar.className = "table-viewer-toolbar";

    overlay.appendChild(stage);
    overlay.appendChild(closeBtn);
    overlay.appendChild(toolbar);
    document.body.appendChild(overlay);

    // Pan/zoom state
    var scale = 1;
    var fitScale = 1; // computed on open; used by reset
    var tx = 0;
    var ty = 0;
    var isDragging = false;
    var startX = 0;
    var startY = 0;
    var lastTouchX = 0;
    var lastTouchY = 0;
    var startDist = 0;
    var startScale = 1;

    // The stage is absolutely positioned (top:50%, left:50%).
    // translate(-50%,-50%) centers it; tx/ty add the user's pan offset.
    function updateTransform(animate) {
      stage.style.transition = animate
        ? "transform 0.3s cubic-bezier(0.25,0.8,0.25,1)"
        : "none";
      stage.style.transform =
        "translate(calc(-50% + " +
        tx +
        "px), calc(-50% + " +
        ty +
        "px)) scale(" +
        scale +
        ")";
    }

    function resetTransform(animate) {
      scale = fitScale;
      tx = 0;
      ty = 0;
      updateTransform(animate !== false);
    }

    function open(table, onToolbar) {
      stage.innerHTML = "";
      // Reset pan; scale will be set after measurement
      tx = 0;
      ty = 0;
      scale = 1;
      stage.style.transition = "none";
      stage.style.transform = "translate(-50%, -50%) scale(1)";

      // Clone the table into a styled container
      var wrap = document.createElement("div");
      wrap.className = "table-viewer-content";
      wrap.appendChild(table.cloneNode(true));
      stage.appendChild(wrap);

      // Toolbar — build before measuring so final layout is stable
      toolbar.innerHTML = "";
      if (typeof onToolbar === "function") onToolbar(toolbar);

      if (toolbar.children.length > 0) {
        var divider = document.createElement("div");
        divider.className = "table-viewer-toolbar-divider";
        toolbar.appendChild(divider);
      }

      function makeBtn(title, icon, onClick) {
        var btn = document.createElement("button");
        btn.className = "table-viewer-btn";
        btn.setAttribute("data-title", title);
        btn.innerHTML = icon;
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          onClick();
        });
        return btn;
      }

      toolbar.appendChild(
        makeBtn("放大", I_ZOOM_IN, function () {
          scale = Math.min(scale * 1.25, 10);
          updateTransform(true);
        }),
      );
      toolbar.appendChild(
        makeBtn("缩小", I_ZOOM_OUT, function () {
          scale = Math.max(scale / 1.25, 0.1);
          updateTransform(true);
        }),
      );
      toolbar.appendChild(
        makeBtn("重置", I_ZOOM_RESET, function () {
          resetTransform(true);
        }),
      );

      // Force synchronous layout to measure the stage's natural size.
      // The overlay is visibility:hidden but still participates in layout,
      // so offsetWidth/Height return accurate values before we show it.
      var stageW = stage.offsetWidth;
      var stageH = stage.offsetHeight;

      // Available viewport: leave room for toolbar (~100px) + close btn (~80px)
      var availW = window.innerWidth * 0.9;
      var availH = window.innerHeight * 0.72;

      fitScale =
        stageW > 0 && stageH > 0
          ? Math.min(1, availW / stageW, availH / stageH)
          : 1;

      // 1. 初始小比例隐藏状态
      scale = fitScale * 0.85;
      updateTransform(false);

      // 2. 激活遮罩
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";

      // 👇 ★★★ 核心魔法：读取 offsetWidth 强制浏览器结算上一帧的 CSS。
      // 打破浏览器的渲染合并机制，让动画必定执行！
      void stage.offsetWidth;

      // 3. 最终放大状态：开启过渡
      scale = fitScale;
      updateTransform(true);
    }

    function close() {
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }

    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener("keydown", function (e) {
      if (!overlay.classList.contains("active")) return;
      if (e.key === "Escape") close();
    });

    // Wheel zoom
    overlay.addEventListener(
      "wheel",
      function (e) {
        if (!overlay.classList.contains("active")) return;
        e.preventDefault();
        scale = Math.min(Math.max(0.1, scale * (e.deltaY < 0 ? 1.1 : 0.9)), 10);
        updateTransform(false);
      },
      { passive: false },
    );

    // Mouse drag
    stage.addEventListener("mousedown", function (e) {
      if (e.button !== 0) return;
      isDragging = true;
      startX = e.clientX - tx;
      startY = e.clientY - ty;
      stage.style.cursor = "grabbing";
      e.preventDefault();
    });
    document.addEventListener("mousemove", function (e) {
      if (!isDragging) return;
      e.preventDefault();
      tx = e.clientX - startX;
      ty = e.clientY - startY;
      updateTransform(false);
    });
    document.addEventListener("mouseup", function () {
      if (isDragging) {
        isDragging = false;
        stage.style.cursor = "grab";
      }
    });

    // Touch pinch/pan
    stage.addEventListener(
      "touchstart",
      function (e) {
        if (e.touches.length === 1) {
          lastTouchX = e.touches[0].clientX;
          lastTouchY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
          startDist = Math.hypot(
            e.touches[1].clientX - e.touches[0].clientX,
            e.touches[1].clientY - e.touches[0].clientY,
          );
          startScale = scale;
        }
      },
      { passive: false },
    );

    stage.addEventListener(
      "touchmove",
      function (e) {
        e.preventDefault();
        if (e.touches.length === 1) {
          tx += e.touches[0].clientX - lastTouchX;
          ty += e.touches[0].clientY - lastTouchY;
          lastTouchX = e.touches[0].clientX;
          lastTouchY = e.touches[0].clientY;
          updateTransform(false);
        } else if (e.touches.length === 2) {
          var newDist = Math.hypot(
            e.touches[1].clientX - e.touches[0].clientX,
            e.touches[1].clientY - e.touches[0].clientY,
          );
          if (newDist > 0 && startDist > 0) {
            scale = Math.min(
              Math.max(0.1, startScale * (newDist / startDist)),
              10,
            );
            updateTransform(false);
          }
        }
      },
      { passive: false },
    );

    viewer = { open: open, close: close };
    return viewer;
  }

  /* ── Open fullscreen for a table ────────────────────────────────────── */
  function openFullscreen(table) {
    var v = getViewer();
    v.open(table, function (toolbar) {
      var notice = document.createElement("span");
      notice.className = "table-viewer-copy-notice";
      notice.textContent = "已复制";

      var cpBtn = document.createElement("button");
      cpBtn.className = "table-viewer-btn";
      cpBtn.setAttribute("data-title", "复制表格");
      cpBtn.innerHTML = I_COPY;
      cpBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        copyTable(table, notice);

        // 👇 ★★★ 新增：全屏模式下的复制按钮也要切换状态，才能激活 CSS 的果冻弹跳反馈！
        cpBtn.setAttribute("data-title", "已复制 ✓");
        setTimeout(function () {
          cpBtn.setAttribute("data-title", "复制表格");
        }, 1500);
      });

      toolbar.appendChild(cpBtn);
      toolbar.appendChild(notice);
    });
  }

  /* ── Main init ──────────────────────────────────────────────────────── */
  function initTables() {
    document
      .querySelectorAll(".post-content table, #article-container table")
      .forEach(function (table) {
        if (
          table.closest("figure.highlight") ||
          table.closest(".highlight-tools")
        )
          return;
        if (table.parentElement.classList.contains("table-wrapper")) return;

        var rows = table.querySelectorAll("tr").length;
        var needsCollapse = rows > TABLE_COLLAPSE_ROWS;

        /* wrapper */
        var wrapper = document.createElement("div");
        wrapper.className = "table-wrapper";
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
        attachHScroll(wrapper);

        /* toolbar */
        var toolbar = document.createElement("div");
        toolbar.className = "table-toolbar";

        var copyNotice = document.createElement("span");
        copyNotice.className = "table-copy-notice";
        copyNotice.textContent = "已复制";

        var cpBtn = document.createElement("button");
        cpBtn.className = "table-toolbar-btn";
        cpBtn.setAttribute("data-title", "复制表格");
        cpBtn.setAttribute("aria-label", "复制表格");
        cpBtn.innerHTML = I_COPY;
        // 修改后的代码：增加 data-title 状态切换来触发 CSS 动画
        cpBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          copyTable(table, copyNotice);

          // 👇 触发成功动画
          cpBtn.setAttribute("data-title", "已复制 ✓");
          setTimeout(function () {
            // 1.5秒后恢复原状，以便下次点击还能触发动画
            cpBtn.setAttribute("data-title", "复制表格");
          }, 1500);
        });

        var fsBtn = document.createElement("button");
        fsBtn.className = "table-toolbar-btn";
        fsBtn.setAttribute("data-title", "全屏查看");
        fsBtn.setAttribute("aria-label", "全屏查看");
        fsBtn.innerHTML = I_FULLSCREEN;
        fsBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          openFullscreen(table);
        });

        toolbar.appendChild(copyNotice);
        toolbar.appendChild(cpBtn);
        toolbar.appendChild(fsBtn);
        wrapper.parentNode.insertBefore(toolbar, wrapper);

        /* collapse */
        if (needsCollapse) {
          wrapper.classList.add("table-collapsed");

          var toggleBtn = document.createElement("button");
          toggleBtn.className = "table-toggle";
          toggleBtn.textContent = "展开表格";
          toggleBtn.addEventListener("click", function () {
            var isCollapsed = wrapper.classList.contains("table-collapsed");
            wrapper.classList.toggle("table-collapsed", !isCollapsed);
            wrapper.classList.toggle("table-expanded", isCollapsed);
            toggleBtn.textContent = isCollapsed ? "折叠表格" : "展开表格";
          });

          wrapper.parentNode.insertBefore(toggleBtn, wrapper.nextSibling);
        }
      });
  }

  /* ── Boot ───────────────────────────────────────────────────────────── */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTables);
  } else {
    initTables();
  }
})();
