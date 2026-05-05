// 先判断主题是否开启了 AI，且配置变量已加载
if (window.theme && window.theme.ai_summary && window.theme.ai_summary.enable) {
  // AI构造函数
  new ChucklePostAI({
    /* 必须配置 */
    el: "#post>#article-container",

    // ！！！在这里动态读取 _config.yml 传过来的全局变量 ！！！
    api_url: window.theme.ai_summary.api_url,
    model: window.theme.ai_summary.model,
    summary_directly: window.theme.ai_summary.summary_directly || false,

    // 驱动AI所必须的key
    key: "",

    /* 非必须配置 */
    title_el: ".post-title",
    rec_method: "web",
    exclude: [
      "highlight",
      "Copyright-Notice",
      "post-ai",
      "post-series",
      "mini-sandbox",
    ],
  });
} else {
  console.log("AI 摘要功能未在配置文件中开启或环境加载失败");
}
