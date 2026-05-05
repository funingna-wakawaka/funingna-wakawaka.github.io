// 文件路径：source/js/ai.js (或你实际存放的路径)
if (window.theme && window.theme.ai_summary && window.theme.ai_summary.enable) {
  new ChucklePostAI({
    el: "#post>#article-container",

    // 动态读取注入的配置
    api_url: window.theme.ai_summary.api_url,
    model: window.theme.ai_summary.model,
    summary_directly: window.theme.ai_summary.summary_directly || false,

    key: "",
    title_el: ".post-title",
    rec_method: "web",
    exclude: [
      "highlight",
      "Copyright-Notice",
      "post-ai",
      "post-series",
      "mini-sandbox",
    ],

    // 界面定制也可从配置读取
    interface: {
      name: window.theme.ai_summary.ai_name || "阿罗娜",
      introduce:
        window.theme.ai_summary.ai_introduce || "老师好，有什么可以帮您？",
      version: window.theme.ai_summary.ai_version || "DeepSeek",
      button: window.theme.ai_summary.buttons || [
        "介绍自己",
        "来点灵感",
        "生成AI简介",
      ],
    },
  });
}
