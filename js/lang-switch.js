document.addEventListener("DOMContentLoaded", function () {
  // 1. 定义翻译字典 (你可以随时加词)
  const translations = {
    // 主界面
    胡杨怕火: "Huyangpahuo",
    "传递笑容魔法的Ciallo～(∠・ω< )⌒☆":
      "Ciallo, the Smiling Magician~ (∠・ω< )⌒☆",
    关于我: "About Me",
    首页: "Home",
    "© 2025 胡杨怕火. 保留所有权利.":
      "© 2025 Huyangpahuo. All rights reserved.",

    // 关于
    暂无数据: "No Data",
    关于: "About",
    称呼: "Name",
    年龄: "Age",
    "19岁": "19 years old",
    大学: "University",
    河南师范大学软件工程: "Henan Normal University, Software Engineering",
    爱好: "Hobbies",
    做游戏和绘画: "Making games and drawing",
    擅长: "Skills",
    吃饱睡睡饱吃: "Eat well, sleep well, repeat",
    身份: "Identity",
    二次元爱好者: "Anime Enthusiast",
    我的技能点: "My Skill Points",
    碎碎念: "Random Thoughts",

    //联系方式
    联系方式: "Contact",
    邮箱: "Email",
    哔哩哔哩: "Bilibili",

    //卡片文字
    逃离后室: "Escape the Backrooms",
    在不断的切出层级中探寻生的希望:
      "Search for hope of survival through endless shifting levels",
    下次窃皮者来的时候不要堵门你尔朵隆吗:
      "Next time the Skin Stealer comes, don’t block the door, you idiot",

    小丑牌: "Balatro",
    一旦拥有爱不释手: "Once you start, you can’t put it down",
    结果就是玩上瘾了: "And that’s how I got completely addicted",

    看门狗: "Watchdog",
    赋予游戏以美国都市的真实感:
      "Brings a realistic American city atmosphere to life",
    "没错,我是嘉豪": "That's Right, I'm Alanwalker",

    我的世界: "Minecraft",
    "生存探索无限,创造缔造奇迹":
      "Infinite survival and exploration, endless creative possibilities",
    准备好进服务器偷别人家了吗孩子们:
      "Ready to join the server and loot other people’s houses, kids?",

    师父: "Sifu",
    抬手不是抱歉: "Every move is a strike, not an apology",
    "这,即是武德.jpg": "This… is martial virtue.jpg",

    米塔: "MiSide",
    满足了我对二次元的所有幻想: "Fulfills all my anime fantasies",
    "幻想死了 狗头狗头狗头": "Fantasy ruined. skull skull skull",

    // 归档
    归档: "Archives",

    // 分类
    分类: "Categories",
    所有分类: "All Categories",
    暂无分类: "No Categories",
    阅读全文: "Read More",
    开始为您的文章添加分类: "Start Adding Categories to Your Posts",
    返回首页: "Back to Home",
    共有: "Total",
    篇文章: "Posts",

    // 标签
    标签: "Tags",
    暂无标签: "No Tags",
    开始为您的文章添加标签: "Start Adding Tags to Your Posts",
    探索与: "Discover",
    相关的所有文章: "related posts",
    返回所有标签: "Back to All Tags",

    // 友链
    友链: "Links",
    传送门: "Portals",
    "暂无友链数据，请在 source/_data/link.yml 中添加友链信息":
      "No link data found. Please add entries to source/_data/link.yml",
    有志者事竟成多么美好的世界呀:
      "Where there's a will there's a way kind of beautiful",
    添加友链: "Add Link",
    "欢迎大家添加友链哦：": "Everyone is welcome to exchange links!",
    "这是我的友链 ~(=^_^)ノ☆ ：": "Here’s my site ~(=^_^)ノ☆:",
    只要你们愿意看我的中二文章都可以添加我的友链哦:
      "As long as you're willing to read my edgy articles, feel free to add my link~",
    "使用以下模板在评论区告诉我你的友链😃我一定会看的!：":
      "Use the template below and leave your info in the comments 😃 I’ll definitely check it out!",
    "我会一直视奸你们的哈哈哈  o(￣ヘ￣o＃) ~":
      "I’ll be watching all of you from the shadows haha o(￣ヘ￣o＃) ~",

    摄影和剪辑: "Photography & Video Editing",
    像素画和二次元绘画: "Pixel Art & Anime-style Illustration",
    Logo和矢量图设计: "Logo & Vector Design",
    各种计算机语言: "Programming Languages",
    Blender建模: "Blender Modeling",
    计算机图形学: "Computer Graphics",
    微信小程序: "WeChat Mini Program Development",
    游戏制作: "Game Development",
    写小说: "Novel Writing",
    我的世界模组制作: "Minecraft Modding",
    英语: "English",
    日语: "Japanese",
    前端和数据库: "Frontend & Database Development",
    安卓应用制作: "Android App Development",

    // 评论区
    评论区: "Comments",
    昵称: "Nickname",
    网址: "URL",
    必填: "Required",
    选填: "Optional",
    预览: "Preview",
    发送: "Submit",
    没有评论: "No Comments",
    Twikoo评论加载成功: "Twikoo comments loaded successfully",

    // 浏览器插件推荐
    浏览器插件推荐: "Plugins",
    "DarkReader(可以强制网页黑色主题)": "DarkReader (Force Dark Mode)",
    "CodeBox(可以下载平台文章)": "CodeBox (Download Articles)",
    "ImmersiveTranslate(可以翻译网页外语)":
      "ImmersiveTranslate (Translate Foreign Languages)",
    "AixDownloader(可以批量下载图片)": "AixDownloader (Batch Download Images)",

    // 更多
    更多: "More",
    我的另一个网站: "My another Site",
    "我的另二个网站(狗头)": "My Other Site (Doge)",
    我的Github小号: "My Github Alternate Account",
    我的Gitee: "My Gitee",
    我的CDSN: "My CSDN",

    // AI摘要
    阿罗娜: "Alona",
    介绍自己: "Introduce",
    来点灵感: "Inspiration",
    生成AI简介: "Generate Summary",
    "老师好, 我是阿罗娜, 一个基于OpenAI GPT-4o的强大语言模型, 今天有什么可以帮到您? 😊":
      "Hello Sensei! I am Alona, powered by OpenAI GPT-4o. How can I help you today? 😊",
    "生成中. . .": "Generating...",
    "Alona请求AI出错了，请稍后再试。":
      "Alona encountered an error while requesting AI. Please try again later.",

    // 文章
    目录: "Directory",
    "← 上一篇": "← Previous",
    "下一篇 →": "Next →",
    分享这篇文章到: "Share this article",
    加载更多文章: "Load More Articles",
    " 加载中...": "Loading...",
    "没有了哦~": "No more articles~",
    加载文章失败: "Error loading articles",
    "搜索文章...": "Search Articles...",
    推特: "Twitter",
    脸书: "Facebook",
    领英: "LinkedIn",
    微信: "WeChat",
    微博: "Weibo",
    点击复制链接: "Copy Link",
  };

  // ==========================================
  // 2. 核心逻辑
  // ==========================================
  let currentLang = localStorage.getItem("site_lang") || "zh";

  // 通用节点翻译函数
  function translateNode(node) {
    // 1. 处理纯文本节点
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue.trim();
      // 这里必须严格匹配字典的 key
      if (text && translations[text]) {
        node.nodeValue = translations[text];
      }
      // 不 return，因为某些情况下文本节点可能有兄弟节点需要处理（虽然在递归里通常由父级控制）
      return;
    }

    // 2. 处理元素节点
    if (node.nodeType === Node.ELEMENT_NODE) {
      // -----------------------------------------------------
      // [新增] 检查并翻译 data-label 属性
      // -----------------------------------------------------
      const label = node.getAttribute("data-label");
      if (label && translations[label]) {
        node.setAttribute("data-label", translations[label]);
      }

      // 如果是输入框，翻译 placeholder
      if (["INPUT", "TEXTAREA"].includes(node.tagName)) {
        const placeholder = node.getAttribute("placeholder");
        if (placeholder && translations[placeholder]) {
          node.setAttribute("placeholder", translations[placeholder]);
        }
      }

      // 递归处理子节点
      Array.from(node.childNodes).forEach(translateNode);
    }
  }

  // 全页翻译 (静态内容)
  function translatePage() {
    translateNode(document.body);
  }

  // ==========================================
  // 3. AI 摘要 & 动态内容监听器 (重点!)
  // ==========================================
  function setupObservers() {
    if (currentLang !== "en") return;

    // 创建一个观察者，专门盯着 #post-ai-container
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // 1. 处理新添加的节点 (比如刚生成的按钮)
        mutation.addedNodes.forEach(translateNode);

        // 2. 处理文字内容的变化 (比如 "生成中..." 变成 "正文内容")
        if (mutation.type === "characterData") {
          translateNode(mutation.target);
        }

        // 3. 处理子元素列表变化 (比如 AI 输出了新的回答)
        if (mutation.type === "childList") {
          mutation.target.childNodes.forEach(translateNode);
        }
      });
    });

    // 开始监听
    // 我们尝试监听整个文章容器，或者直接监听 body (稍微耗性能但最稳)
    // 这里为了稳妥，我们监听 document.body，但加一个过滤器只处理 ai 相关的
    const targetNode = document.body;
    observer.observe(targetNode, {
      childList: true,
      subtree: true,
      characterData: true, // 关键：监听文字变化
    });
  }

  // ==========================================
  // 4. 语言切换按钮逻辑
  // ==========================================
  function setupLanguageButton() {
    const buttons = document.querySelectorAll('a[href*="#lang-switch"]');
    buttons.forEach((btn) => {
      btn.innerText = currentLang === "en" ? "🇨🇳 中文" : "🇺🇸 English";
      btn.removeAttribute("href");
      btn.style.cursor = "pointer";
      btn.onclick = (e) => {
        e.preventDefault();
        const newLang = currentLang === "en" ? "zh" : "en";
        localStorage.setItem("site_lang", newLang);
        location.reload();
      };
    });
  }

  // ==========================================
  // 5. 初始化执行
  // ==========================================
  if (currentLang === "en") {
    // 1. 先翻译静态内容
    translatePage();

    // 2. 启动监听器，搞定动态内容
    setupObservers();
  }

  // 初始化按钮 (延迟一点以防按钮还没加载)
  setupLanguageButton();
  setTimeout(setupLanguageButton, 500);
});
