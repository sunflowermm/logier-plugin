# 鸢尾花插件 (logier-plugin)

<div align="center">
  <a href="https://logier.gitee.io/">
    <img src="./resources/img/logo.png" alt="Logo" height="120">
  </a>
  <br><br>
  <a href="https://qm.qq.com/cgi-bin/qm/qr?k=Tx0KJBxwamQ1slXC4d3ZVhSigQ9MiCmJ&jump_from=webapi&authKey=BJVVNjuciQCnetGahh3pNOirLULs1XA7fQMn/LlPWAWk5GDdr2WWB/zHim1k1OoY">QQ 群</a>
  ·
  <a href="https://logier.gitee.io/">原作者博客</a>
  ·
  <a href="https://gitee.com/logier/logier-plugins">Gitee</a>
  ·
  <a href="https://github.com/logier/logier-plugins">GitHub</a>
</div>

## 关于本分支

本仓库为 **向日葵 / XRK-Yunzai 维护版本**，在原作者 [logier](https://gitee.com/logier) 的鸢尾花插件基础上精简改造：

- 移除了大部分依赖外部 API / GPT 的功能（天气、番剧、表情包、戳一戳、自定义 API 等）
- 运势、算卦、签到、今日老婆等改为 **本地 gallery 背景 + Puppeteer 渲染**，渲染失败时有文本兜底
- **塔罗牌模块已重做**：78 张牌图本地化，牌义与图片按 `Brand_Link` 一一对应，支持单牌、牌阵、查牌、每日塔罗等

发送 `#鸢尾花帮助` 可查看完整指令列表。

## 安装

在 Yunzai / XRK-Yunzai 根目录执行：

```bash
git clone --depth=1 <本仓库地址> ./plugins/logier-plugin/
```

或使用原作者仓库（功能与上游可能不同）：

```bash
git clone --depth=1 https://gitee.com/logier/logier-plugins.git ./plugins/logier-plugin/
# 或
git clone --depth=1 https://github.com/logier/logier-plugins.git ./plugins/logier-plugin/
```

## 保留功能概览

| 分类 | 指令示例 |
|------|----------|
| 帮助 | `#鸢尾花帮助` `#鸢尾花版本` `#鸢尾花更新`（主人） |
| 运势 | `#签到` `#今日运势` `#悔签` `#算一卦` `#悔卦` `#今日老婆` |
| 塔罗 | `#塔罗` `#查牌愚者` `#占卜` `#牌阵 圣三角` `#每日塔罗` `#塔罗帮助` |
| 群聊 | 入群欢迎、退群通知 |

塔罗默认牌阵可在锅巴中配置；亦支持 `#牌阵列表` 查看全部牌阵。

## 原作者与鸣谢

- 原作者：[@logier](https://gitee.com/logier) · [个人博客](https://logier.gitee.io/) · [QQ 群](https://qm.qq.com/cgi-bin/qm/qr?k=Tx0KJBxwamQ1slXC4d3ZVhSigQ9MiCmJ&jump_from=webapi&authKey=BJVVNjuciQCnetGahh3pNOirLULs1XA7fQMn/LlPWAWk5GDdr2WWB/zHim1k1OoY) · [爱发电](https://afdian.net/a/logier)

参考与致谢：

- [今日运势源仓库](https://github.com/twiyin0/koishi-plugin-jryspro)
- [云崽插件基础示例](https://gitee.com/Zyy955/Miao-Yunzai-plugin)
- [云崽市场](https://gitee.com/yhArcadia/Yunzai-Bot-plugins-indexn)
- [向日葵插件](https://gitee.com/xrk114514/xrk-plugin)

## 许可

沿用原插件 LICENSE；二次修改部分遵循 XRK-Yunzai 社区维护约定。
