/**
 * 塔罗预渲染：校验配置并输出 README 展示用 PNG
 * 用法（XRK-Yunzai 根目录）：node plugins/logier-plugin/scripts/render-tarot-test.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(pluginRoot, 'docs/previews')
process.chdir(path.resolve(pluginRoot, '../..'))

global.segment = { image (data) { return { type: 'image', file: data } } }

fs.mkdirSync(outDir, { recursive: true })

const render = (await import('../components/renderer.js')).default
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

async function shot (fileName, tpl, params) {
  const file = path.join(outDir, fileName)
  const img = await render(tpl, { ...params, saveId: fileName.replace(/\.png$/, '') }, {})
  if (!writePng(img, file)) throw new Error(`渲染失败: ${fileName}`)
  return file
}

const configErrors = validateTarotConfig()
if (configErrors.length) {
  console.error('配置校验失败:\n' + configErrors.map(e => `  - ${e}`).join('\n'))
  process.exit(1)
}

const meta = { userName: '预览', topic: '布局渲染测试' }
const results = []

for (const name of listFormationNames({ internal: true })) {
  const spread = drawSpread(name)
  if (!spread) throw new Error(`drawSpread 失败: ${name}`)
  results.push({
    name,
    file: await shot(spreadPreviewName(name), 'tarot/spread', toSpreadView(spread, meta))
  })
}

results.push({ name: '单牌', file: await shot('card-single.png', 'tarot/card', toCardView(drawSingle(), '单牌预览')) })

const lookup = drawLookup('愚者')
if (!lookup) throw new Error('drawLookup 失败')
results.push({
  name: '查牌',
  file: await shot('card-lookup.png', 'tarot/card', toCardView(lookup, '#查牌 · 愚者', { mode: 'lookup' }))
})

results.push({
  name: '彩虹塔罗',
  file: await shot('card-rainbow.png', 'tarot/card', toCardView(drawMajorRainbow(), '彩虹塔罗预览'))
})

console.log(`塔罗预渲染完成：${results.length} 张 → ${outDir}`)
for (const r of results) console.log(`  OK ${r.name} → ${path.basename(r.file)}`)
