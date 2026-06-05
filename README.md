# 鸢尾花插件 (logier-plugin)

<div align="center">
  <img src="./resources/img/logo.png" alt="Logo" height="120">
  <br><br>
  <strong>向日葵 / XRK-Yunzai 维护版</strong>
</div>

版本：1.0.0-sunflower

## 关于本分支

本仓库为 **向日葵 / XRK-Yunzai 维护版本**。在原作者 logier 的鸢尾花插件基础上精简改造，**所有功能资源均为本地文件**，运行时不再请求外部图床或诗词 API。

- 移除了依赖外部 API / GPT 的功能（天气、番剧、表情包、戳一戳等）
- 运势、算卦、签到、今日老婆等使用 **本地 gallery 背景 + Puppeteer 渲染**，失败时有文本兜底
- **塔罗模块**：78 张牌图与牌义数据均在 `resources/tarot/` 与 `data/tarot.json`，支持单牌、牌阵、查牌、每日塔罗

发送 `#鸢尾花帮助` 可查看完整指令列表。

## 安装

在 Yunzai / XRK-Yunzai 根目录执行：

```bash
git clone --depth=1 https://github.com/sunflowermm/logier-plugin ./plugins/logier-plugin/
```

## 保留功能概览

| 分类 | 指令示例 |
|------|----------|
| 帮助 | `#鸢尾花帮助` `#鸢尾花版本` `#鸢尾花更新`（主人） |
| 运势 | `#签到` `#今日运势` `#悔签` `#算一卦` `#悔卦` `#今日老婆` |
| 塔罗 | `#塔罗` `#查牌愚者` `#占卜` `#牌阵 圣三角` `#每日塔罗` `#塔罗帮助` |
| 群聊 | 入群欢迎、退群通知 |

塔罗默认牌阵可在锅巴中配置；亦支持 `#牌阵列表` 查看全部牌阵。

## 本地资源说明

| 目录 | 用途 | 来源 |
|------|------|------|
| `resources/gallery/` | 运势/签到/算卦等随机 `wall-*` 风景壁纸（高清横图） | 本地壁纸集 + Unsplash 风景 |
| `resources/help/` | 帮助页每次随机 `wall-*` 作 cover 背景 | 与运势共用 gallery |
| `resources/tarot/cards/` | 78 张塔罗牌面 | 本地化牌图（语义文件名 `a0`–`a21`、`s1`–`s14` 等） |
| `data/jrys.json` | 今日运势文案 | 参考 [koishi-plugin-jryspro](https://github.com/Twiyin0/koishi-plugin-jryspro) |
| `data/suangua.json` | 算卦文案 | 插件本地数据 |
| `data/tarot.json` | 牌义与牌阵 | 插件本地数据（含 `image` 字段指向本地牌图） |
| `resources/common/` | 帮助页字体、主题、布局 | 插件自带 |

## 原作者与鸣谢

- 原作者：[@logier](https://gitee.com/logier)（上游已停更，本分支独立维护）
- [今日运势文案参考](https://github.com/twiyin0/koishi-plugin-jryspro)
- [向日葵插件](https://github.com/sunflowermm/XRK-plugin)

## 许可

沿用原插件 LICENSE；二次修改部分遵循 XRK-Yunzai 社区维护约定。
