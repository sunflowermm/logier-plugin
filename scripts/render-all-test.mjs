/**
 * 鸢尾花插件全量渲染测试（塔罗 + 运势/签到/算卦/帮助）
 * 用法（XRK-Yunzai 根目录）：node plugins/logier-plugin/scripts/render-all-test.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import lodash from 'lodash'

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(pluginRoot, 'docs/previews')
process.chdir(path.resolve(pluginRoot, '../..'))

global.segment = { image (data) { return { type: 'image', file: data } } }

fs.mkdirSync(outDir, { recursive: true })

const render = (await import('../components/renderer.js')).default
const { renderHtmlImage } = await import('../components/renderer.js')
const Data = (await import('../components/Data.js')).default
const Theme = (await import('../apps/Help/Helptheme.js')).default
const {
  validateTarotConfig,
  listFormationNames,
  spreadPreviewName,
  drawSpread,
  drawSingle,
  drawLookup,
  drawMajorRainbow,
  toSpreadView,
  toCardView
} = await import('../model/tarot.js')
const {
  pickRenderBackground,
  fortuneSplitHtml,
  fortuneBodyHtml,
  guaBodyHtml,
  signCardHtml,
  mediaAvatarOverlay,
  escHtml,
  toFileUrl,
  CANVAS_SPLIT,
  CANVAS_SIGN
} = await import('../utils/render-layout.js')

function writePng (data, filePath) {
  if (Buffer.isBuffer(data)) {
    fs.writeFileSync(filePath, data)
    return true
  }
  if (data instanceof Uint8Array) {
    fs.writeFileSync(filePath, Buffer.from(data))
    return true
  }
  return false
}

async function shotTpl (fileName, tpl, params) {
  const file = path.join(outDir, fileName)
  const img = await render(tpl, { ...params, saveId: fileName.replace(/\.png$/, '') }, {})
  if (!writePng(img, file)) throw new Error(`模板渲染失败: ${fileName}`)
  return file
}

async function shotHtml (fileName, html, extra = {}) {
  const file = path.join(outDir, fileName)
  const img = await renderHtmlImage(html, extra)
  if (!writePng(img, file)) throw new Error(`HTML 渲染失败: ${fileName}`)
  return file
}

const results = []

const tarotErrors = validateTarotConfig()
if (tarotErrors.length) {
  console.error('塔罗配置校验失败:\n' + tarotErrors.map(e => `  - ${e}`).join('\n'))
  process.exit(1)
}

const meta = { userName: '预览', topic: '布局渲染测试' }

for (const name of listFormationNames({ internal: true })) {
  const spread = drawSpread(name)
  if (!spread) throw new Error(`drawSpread 失败: ${name}`)
  results.push({
    name,
    file: await shotTpl(spreadPreviewName(name), 'tarot/spread', toSpreadView(spread, meta))
  })
}

results.push({ name: '单牌', file: await shotTpl('card-single.png', 'tarot/card', toCardView(drawSingle(), '单牌预览')) })

const lookup = drawLookup('愚者')
if (!lookup) throw new Error('drawLookup 失败')
results.push({
  name: '查牌',
  file: await shotTpl('card-lookup.png', 'tarot/card', toCardView(lookup, '#查牌 · 愚者', { mode: 'lookup' }))
})

results.push({
  name: '彩虹塔罗',
  file: await shotTpl('card-rainbow.png', 'tarot/card', toCardView(drawMajorRainbow(), '彩虹塔罗预览'))
})

const bg = pickRenderBackground()

results.push({
  name: '签到',
  file: await shotHtml('feat-sign.png', signCardHtml({
    filePath: bg,
    header: '<p><span>上午好！</span>预览用户</p><p>好感度+5</p>',
    date: new Date().toLocaleDateString('zh-CN'),
    quote: '生活明朗，万物可爱。',
    footer: '当前好感度：<span class="highlight">42</span>，群排名：<span class="highlight">第1位</span>'
  }), { ...CANVAS_SIGN, fullPage: true })
})

const jrys = JSON.parse(fs.readFileSync(path.join(pluginRoot, 'data/jrys.json'), 'utf8'))
const fortune = jrys[0]
results.push({
  name: '今日运势',
  file: await shotHtml('feat-fortune.png', fortuneSplitHtml({
    filePath: bg,
    titleLines: `<p>预览用户的十五号运势为</p><h2>${escHtml(fortune.fortuneSummary)}</h2><p>${escHtml(fortune.luckyStar)}</p>`,
    bodyHtml: fortuneBodyHtml(fortune.signText, fortune.unsignText)
  }), CANVAS_SPLIT)
})

const suangua = JSON.parse(fs.readFileSync(path.join(pluginRoot, 'data/suangua.json'), 'utf8'))
const gua = suangua[0]
results.push({
  name: '算一卦',
  file: await shotHtml('feat-gua.png', fortuneSplitHtml({
    filePath: bg,
    titleLines: `<p class="sub">预览用户心中所念「测试问事」</p><p class="sub">卦象如下</p><h2>${escHtml(gua.name)}</h2><p class="sub">${escHtml(gua.guachi)}</p>`,
    bodyHtml: guaBodyHtml(gua)
  }), CANVAS_SPLIT)
})

results.push({
  name: '今日老婆',
  file: await shotHtml('feat-marry.png', fortuneSplitHtml({
    filePath: bg,
    textRatio: 0.36,
    footerText: '',
    mediaOverlay: mediaAvatarOverlay('https://q1.qlogo.cn/g?b=qq&nk=10001&s=640'),
    titleLines: '<h2>今日老婆</h2><p class="wife-name">预览群友</p>',
    bodyHtml: '<div class="body fortune"><p>佳偶天成心相印，百年好合乐无边</p></div>'
  }), { ...CANVAS_SPLIT, imageWaitTimeout: 5000 })
})

const { diyCfg, sysCfg } = await Data.importCfg('help')
const helpConfig = lodash.defaults(diyCfg.helpCfg || {}, sysCfg.helpCfg)
const helpList = diyCfg.helpList || sysCfg.helpList
const helpGroup = []
lodash.forEach(helpList, (group) => {
  lodash.forEach(group.list, (help) => {
    const icon = help.icon * 1
    if (!icon) help.css = 'display:none'
    else {
      const x = (icon - 1) % 10
      const y = (icon - x - 1) / 10
      help.css = `background-position:-${x * 50}px -${y * 50}px`
    }
  })
  helpGroup.push(group)
})
const themeData = await Theme.getThemeData(diyCfg.helpCfg || {}, sysCfg.helpCfg || {}, toFileUrl(pickRenderBackground()))
results.push({
  name: '鸢尾花帮助',
  file: await shotTpl('feat-help.png', 'help/index', {
    helpCfg: helpConfig,
    helpGroup,
    ...themeData,
    element: 'default'
  })
})

console.log(`鸢尾花全量渲染完成：${results.length} 张 → ${outDir}`)
for (const r of results) console.log(`  OK ${r.name} → ${path.basename(r.file)}`)
