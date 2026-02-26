document.addEventListener("DOMContentLoaded", function () {
  // 1. 定义翻译字典 (你可以随时加词)
  const translations = {
    // 主界面
    胡杨怕火: "Huyangpahuo",
    "传递笑容魔法的Ciallo～(∠・ω< )⌒☆":
      "Ciallo, the Smiling Magician~ (∠・ω< )⌒☆",
    关于我: "About Me",
    首页: "Home",
    加载更多文章: "Load More Articles",
    "搜索文章...": "Search Articles...",

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
    开始为您的文章添加分类: "Start Adding Categories to Your Posts",
    返回首页: "Back to Home",

    // 标签
    标签: "Tags",
    暂无标签: "No Tags",
    开始为您的文章添加标签: "Start Adding Tags to Your Posts",

    // 友链
    友链: "Links",
    传送门: "Portals",
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
    昵称: "Nickname",
    网址: "URL",
    必填: "Required",
    选填: "Optional",
    预览: "Preview",
    发送: "Submit",
    没有评论: "No Comments",

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
  };

  // 2. 初始化语言状态
  let currentLang = localStorage.getItem("site_lang") || "zh";

  // 3. 核心翻译函数
  function translatePage() {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false,
    );
    let node;
    while ((node = walker.nextNode())) {
      const text = node.nodeValue.trim();
      if (translations[text]) {
        node.nodeValue = translations[text];
      }
    }

    // 替换 placeholder
    document.querySelectorAll("input, textarea").forEach((el) => {
      if (translations[el.placeholder])
        el.placeholder = translations[el.placeholder];
    });
  }

  // 4. 【关键】处理切换按钮 (精准定位 href="#lang-switch")
  function setupLanguageButton() {
    // 查找所有 href 属性包含 "#lang-switch" 的 A 标签
    const buttons = document.querySelectorAll('a[href*="#lang-switch"]');

    buttons.forEach((btn) => {
      // 设置按钮文字
      // 如果当前是英文，按钮显示“中文”；如果当前是中文，按钮显示“English”
      btn.innerText = currentLang === "en" ? "🇨🇳 中文" : "🇺🇸 English";

      // 移除原本的 href，防止页面跳转
      btn.removeAttribute("href");
      btn.style.cursor = "pointer"; // 变成小手图标

      // 绑定点击事件
      btn.onclick = function (e) {
        e.preventDefault(); // 阻止默认点击行为
        toggleLanguage();
      };
    });
  }

  // 5. 切换语言动作
  function toggleLanguage() {
    currentLang = currentLang === "en" ? "zh" : "en";
    localStorage.setItem("site_lang", currentLang);
    location.reload(); // 刷新页面应用新语言
  }

  // --- 执行逻辑 ---

  // 1. 如果是英文模式，先翻译页面
  if (currentLang === "en") {
    translatePage();
  }

  // 2. 无论什么模式，都要把按钮改造成切换键
  // 为了防止主题 JS 还没加载完，我们尝试多次执行
  setupLanguageButton();
  setTimeout(setupLanguageButton, 500); // 延迟 0.5 秒再执行一次，确保抓到
  setTimeout(setupLanguageButton, 1500); // 延迟 1.5 秒再执行一次，以防万一
});
