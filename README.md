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
- **塔罗模块**：78 张牌图与牌义在 `resources/tarot/`，牌阵与布局在 `data/tarot.json`（`layouts` + `formations` 单一数据源）

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

## 塔罗指令

| 指令 | 说明 |
|------|------|
| `#塔罗 [主题]` | 单牌；若 `[主题]` 匹配牌名则查牌 |
| `#二牌 [主题]` | 现状 / 指引 |
| `#占卜 [主题]` | 默认 **圣三角牌阵**（锅巴可改） |
| `#牌阵 名称 [主题]` | 指定牌阵；支持连写 `#牌阵圣三角我今天高兴吗` |
| `#牌阵列表` | 全部牌阵与牌位 |
| `#查牌名称` | 正逆位牌义 |
| `#每日塔罗` | 每日一牌（Redis 缓存） |
| `#彩虹塔罗` | 大阿卡纳单牌 |
| `#塔罗牌库` | 78 张索引 |
| `#塔罗帮助` | 指令说明 |

## 牌阵一览（17 种）

布局定义见 `data/tarot.json` → `layouts`，CSS 见 `resources/tarot/spread.css`。

| 牌阵 | 张数 | 简称 | 布局 | 用途 |
|------|------|------|------|------|
| 圣三角牌阵 | 3 | 圣三角 | 三角 | 通用，默认 `#占卜` |
| 时间之流牌阵 | 3 | 时间之流 | 横排 | 过去 → 现在 → 未来 |
| 四要素牌阵 | 4 | 四要素 | 菱形 | 火风水土 |
| 五牌阵 | 5 | 五牌 | 十字 | 核心 / 因果 / 结果 |
| 吉普赛十字阵 | 5 | 吉普赛十字 | 爱情十字 | 心态·状况·举措·环境·结果 |
| 马蹄牌阵 | 7 | 马蹄 | U 形 | 时序综合 |
| 六芒星牌阵 | 7 | 六芒星 | 大卫之星（双三角+中心） | 复杂问题 |
| 平安扇牌阵 | 4 | 平安扇 | 1→2→3 扇开 + 结论横放 | 人际关系 |
| 沙迪若之星牌阵 | 6 | 沙迪若 | 星形六牌 | 心理因果 |
| 凯尔特十字牌阵 | 10 | 凯尔特十字 | 凯尔特十字 | 深度分析 |
| 身心灵牌阵 | 3 | 身心灵 | 纵向 | 身 / 心 / 灵 |
| 二选一牌阵 | 5 | 二选一 | T 形 | A / B 抉择 |
| 恋人金字塔牌阵 | 4 | 恋人金字塔 | 金字塔 | 恋爱关系 |
| 工作发展牌阵 | 5 | 工作发展 | 阶梯路径 | 事业规划 |
| 维纳斯之爱牌阵 | 8 | 维纳斯 | ♀ 三列中轴 | 爱情深度 |
| 大十字牌阵 | 5 | 大十字 | 四角+中心 | 通用困境（大十字推测法） |
| 四季牌阵 | 4 | 四季 | 横排 | 阶段性运势 |

**维纳斯之爱（三列中轴）**：中列 v4→v3→v5→v6；左 v1/v7；右 v2/v8。

**吉普赛十字 vs 大十字**：前者为爱情专用十字；后者为四角+中心菱形，参考 [星座屋·大十字推测法](https://m.xzw.com/tarot/tutorial/2014/0827/195890.html)。

**凯尔特十字（Waite 标准）**：中心现状竖放 + 挑战横放（横牌半透明叠放，牌名如 `圣杯2 · 横放`）· 右侧权杖列 7→10 自下而上。

## 渲染预览

以下为随仓库发布的预渲染 PNG（`docs/previews/`），改布局后由维护者本地重渲并提交更新即可。

| 圣三角牌阵 | 时间之流牌阵 |
|:---:|:---:|
| ![圣三角牌阵](./docs/previews/spread-圣三角牌阵.png) | ![时间之流牌阵](./docs/previews/spread-时间之流牌阵.png) |

| 四要素牌阵 | 五牌阵 |
|:---:|:---:|
| ![四要素牌阵](./docs/previews/spread-四要素牌阵.png) | ![五牌阵](./docs/previews/spread-五牌阵.png) |

| 吉普赛十字阵 | 马蹄牌阵 |
|:---:|:---:|
| ![吉普赛十字阵](./docs/previews/spread-吉普赛十字阵.png) | ![马蹄牌阵](./docs/previews/spread-马蹄牌阵.png) |

| 六芒星牌阵 | 平安扇牌阵 |
|:---:|:---:|
| ![六芒星牌阵](./docs/previews/spread-六芒星牌阵.png) | ![平安扇牌阵](./docs/previews/spread-平安扇牌阵.png) |

| 沙迪若之星牌阵 | 凯尔特十字牌阵 |
|:---:|:---:|
| ![沙迪若之星牌阵](./docs/previews/spread-沙迪若之星牌阵.png) | ![凯尔特十字牌阵](./docs/previews/spread-凯尔特十字牌阵.png) |

| 身心灵牌阵 | 二选一牌阵 |
|:---:|:---:|
| ![身心灵牌阵](./docs/previews/spread-身心灵牌阵.png) | ![二选一牌阵](./docs/previews/spread-二选一牌阵.png) |

| 恋人金字塔牌阵 | 工作发展牌阵 |
|:---:|:---:|
| ![恋人金字塔牌阵](./docs/previews/spread-恋人金字塔牌阵.png) | ![工作发展牌阵](./docs/previews/spread-工作发展牌阵.png) |

| 维纳斯之爱牌阵 | 大十字牌阵 |
|:---:|:---:|
| ![维纳斯之爱牌阵](./docs/previews/spread-维纳斯之爱牌阵.png) | ![大十字牌阵](./docs/previews/spread-大十字牌阵.png) |

| 四季牌阵 | 二牌阵 |
|:---:|:---:|
| ![四季牌阵](./docs/previews/spread-四季牌阵.png) | ![二牌阵](./docs/previews/spread-二牌阵.png) |

| 单牌 | 查牌 |
|:---:|:---:|
| ![单牌](./docs/previews/card-single.png) | ![查牌](./docs/previews/card-lookup.png) |

| 彩虹塔罗 | 签到 |
|:---:|:---:|
| ![彩虹塔罗](./docs/previews/card-rainbow.png) | ![签到](./docs/previews/feat-sign.png) |

| 今日运势 | 算一卦 |
|:---:|:---:|
| ![今日运势](./docs/previews/feat-fortune.png) | ![算一卦](./docs/previews/feat-gua.png) |

| 今日老婆 | 鸢尾花帮助 |
|:---:|:---:|
| ![今日老婆](./docs/previews/feat-marry.png) | ![鸢尾花帮助](./docs/previews/feat-help.png) |

## 塔罗模块结构

```
logier-plugin/
├── commonconfig/tarot.js    # CommonConfig（XRK 控制台 · 鸢尾花 · 塔罗）
├── config/Tarot.yaml        # 用户配置
├── defSet/Tarot.yaml        # 默认模板
├── data/tarot.json
├── model/tarot.js
├── model/tarot-config.js    # 读写 CommonConfig
├── apps/Tarot.js
├── guoba.support.js         # 锅巴下拉选牌阵
├── resources/tarot/
└── docs/previews/*.png
```

锅巴与 XRK 控制台均编辑 `defaultFormation`（17 种公开牌阵下拉），`#占卜` 读取同一配置。

## 本地资源说明

| 目录 | 用途 |
|------|------|
| `commonconfig/tarot.js` | CommonConfig schema（控制台「鸢尾花 · 塔罗」） |
| `config/Tarot.yaml` | 塔罗用户配置（默认牌阵） |
| `resources/tarot/cards/` | 78 张塔罗牌面 |
| `resources/tarot/spread.css` | 牌阵物理布局 |
| `data/tarot.json` | 牌义、layouts、formations |
| `resources/gallery/wall-*` | 运势/帮助等随机风景背景 |
| `docs/previews/` | README 展示用预渲染 PNG |

## 原作者与鸣谢

- 原作者：[@logier](https://gitee.com/logier)（上游已停更，本分支独立维护）
- [今日运势文案参考](https://github.com/twiyin0/koishi-plugin-jryspro)
- [向日葵插件](https://github.com/sunflowermm/XRK-plugin)

## 许可

沿用原插件 LICENSE；二次修改部分遵循 XRK-Yunzai 社区维护约定。
