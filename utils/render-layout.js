import { pluginAssetUrl } from './getdate.js'
import { layoutForImage, pickGalleryFile, toFileUrl } from './gallery-image.js'

const FONT_CSS = `@font-face{font-family:'HYWH';src:url('${pluginAssetUrl('resources/common/font/HYWH-65W.woff')}') format('woff');}`

/** wall- 风景壁纸：16:9 横图，高度≥1080 */
const WALL = { preferPrefix: ['wall-'], minRatio: 1.5, maxRatio: 2.8, minWidth: 1600, minHeight: 900 }
const SCENIC = { ...WALL, minHeight: 1080 }

export const CANVAS_SPLIT = { width: 1280, height: 900 }
export const CANVAS_SIGN = { width: 800, height: 720 }

export function escHtml (text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function pickRenderBackground (purpose = 'default') {
  const presets = {
    fortune: WALL,
    sign: WALL,
    wide: SCENIC
  }
  return pickGalleryFile(presets[purpose] || SCENIC)
}

export function coverImgHtml (filePath, boxW, boxH) {
  const lay = layoutForImage(filePath, boxW, boxH)
  return `<div style="width:${boxW}px;height:${boxH}px;overflow:hidden;background:#1a1a2e;"><img src="${lay.url}" style="${lay.imgCss}" alt=""/></div>`
}

/** 运势 / 老婆：左文右图 */
export function fortuneSplitHtml ({
  titleLines,
  bodyHtml,
  filePath,
  canvasW = CANVAS_SPLIT.width,
  canvasH = CANVAS_SPLIT.height,
  textRatio = 0.34,
  footerText = '| 相信科学，请勿迷信 |'
}) {
  const textW = Math.round(canvasW * textRatio)
  const imgW = canvasW - textW
  const imgBlock = coverImgHtml(filePath, imgW, canvasH)
  const footer = footerText ? `<p class="footer">${escHtml(footerText)}</p>` : ''
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"/><style>
${FONT_CSS}
html,body{margin:0;padding:0;width:${canvasW}px;height:${canvasH}px;overflow:hidden;font-family:'HYWH','Microsoft YaHei',sans-serif;background:#f4f0eb;}
.wrap{display:flex;width:${canvasW}px;height:${canvasH}px;}
.text{flex:0 0 ${textW}px;height:100%;box-sizing:border-box;padding:28px 20px;background:rgba(255,255,255,0.82);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;text-align:center;box-shadow:inset -1px 0 0 rgba(0,0,0,0.06);}
.text h2{margin:8px 0;font-size:1.6rem;color:#5c4a32;}
.text p{margin:6px 0;line-height:1.65;color:#333;font-size:1rem;}
.body{flex:1;margin-top:12px;padding:16px 12px;background:rgba(255,255,255,0.55);border-radius:12px;writing-mode:vertical-lr;text-orientation:upright;max-height:62%;overflow:hidden;font-size:0.95rem;line-height:1.8;}
.media{flex:0 0 ${imgW}px;height:100%;}
.footer{margin-top:auto;font-size:0.85rem;color:#888;}
</style></head><body><div class="wrap"><div class="text">${titleLines}${bodyHtml}${footer}</div><div class="media">${imgBlock}</div></div></body></html>`
}

/** 算卦：左图右文 */
export function guaSplitHtml ({
  intro,
  paragraphs,
  filePath,
  canvasW = CANVAS_SPLIT.width,
  canvasH = CANVAS_SPLIT.height
}) {
  const imgW = Math.round(canvasW * 0.42)
  const textW = canvasW - imgW
  const imgBlock = coverImgHtml(filePath, imgW, canvasH)
  const ps = paragraphs.map(p => `<p>${escHtml(p)}</p>`).join('')
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"/><style>
${FONT_CSS}
html,body{margin:0;width:${canvasW}px;height:${canvasH}px;overflow:hidden;font-family:'HYWH','Microsoft YaHei',sans-serif;background:#f8f8f8;}
.wrap{display:flex;width:${canvasW}px;height:${canvasH}px;}
.media{flex:0 0 ${imgW}px;}
.text{flex:0 0 ${textW}px;box-sizing:border-box;padding:32px 28px;background:rgba(255,255,255,0.9);box-shadow:-2px 0 12px rgba(0,0,0,0.08);}
.text b{display:block;font-size:1.35rem;margin-bottom:16px;color:#2c2c2c;}
.text p{margin:12px 0;font-size:1.05rem;line-height:1.75;color:rgba(0,0,0,0.78);white-space:pre-wrap;}
</style></head><body><div class="wrap"><div class="media">${imgBlock}</div><div class="text"><b>${escHtml(intro)}</b>${ps}</div></div></body></html>`
}

/** 签到卡片 */
export function signCardHtml ({ header, date, quote, footer, filePath, cardW = CANVAS_SIGN.width }) {
  const imgH = 420
  const lay = layoutForImage(filePath, cardW - 40, imgH)
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"/><style>
html,body{margin:0;font-family:'Microsoft YaHei',sans-serif;background:#eef2f6;}
#main{width:${cardW}px;margin:16px auto;border-radius:12px;overflow:hidden;background:#fff;box-shadow:0 4px 16px rgba(0,0,0,0.1);}
#header{padding:18px 20px;background:linear-gradient(135deg,#f0f8ff,#cce7ff);}
#header span{font-size:1.15rem;font-weight:bold;color:#0078d7;}
#content{padding:16px 20px 8px;text-align:center;}
.img-box{width:100%;height:${imgH}px;overflow:hidden;border-radius:10px;margin:10px 0;background:#1a1a2e;}
.img-box img{${lay.imgCss}}
.quote{font-style:italic;color:#666;margin:8px 0 4px;}
#footer{padding:14px;background:#f8f9fa;text-align:center;border-top:1px solid #eee;font-size:0.95rem;}
.highlight{font-weight:bold;color:#0078d7;}
</style></head><body><div id="main"><div id="header">${header}</div><div id="content"><div>${escHtml(date)}</div><div class="img-box"><img src="${lay.url}" style="${lay.imgCss}" alt=""/></div><p class="quote">「${escHtml(quote)}」</p></div><div id="footer">${footer}</div></div></body></html>`
}

export { toFileUrl }
