import { pluginAssetUrl } from './getdate.js'
import { layoutForImage, pickGalleryFile, toFileUrl } from './gallery-image.js'

const FONT_CSS = `@font-face{font-family:'HYWH';src:url('${pluginAssetUrl('resources/common/font/HYWH-65W.woff')}') format('woff');}`
const WALL = { preferPrefix: ['wall-'], minRatio: 1.4, maxRatio: 3.6, minWidth: 1600, minHeight: 600 }

export const CANVAS_SPLIT = { width: 1280, height: 900 }
export const CANVAS_SIGN = { width: 800, height: 720 }

export function escHtml (text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function qqAvatarUrl (userId, size = 640) {
  return `https://q1.qlogo.cn/g?b=qq&nk=${userId}&s=${size}`
}

export function pickRenderBackground () {
  return pickGalleryFile(WALL)
}

const SPLIT_CSS = `
html,body{margin:0;padding:0;width:var(--cw);height:var(--ch);overflow:hidden;font-family:'HYWH','Microsoft YaHei',sans-serif;background:#ebe6df;}
.wrap{display:flex;width:var(--cw);height:var(--ch);}
.text{flex:0 0 var(--tw);height:100%;box-sizing:border-box;padding:22px 14px 18px;background:linear-gradient(108deg,rgba(255,255,255,0.94),rgba(255,255,255,0.8));display:flex;flex-direction:column;align-items:center;box-shadow:inset -1px 0 0 rgba(0,0,0,0.05);}
.text-main{flex:1;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:0;}
.text h2{margin:6px 0;font-size:1.18rem;font-weight:700;color:#5c4a32;line-height:1.4;text-align:center;max-width:100%;}
.text p{margin:4px 0;line-height:1.6;color:#444;font-size:0.92rem;text-align:center;}
.text .sub{font-size:0.84rem;color:#666;}
.text .wife-name{font-size:1.15rem;font-weight:bold;color:#5c4a32;}
.body{box-sizing:border-box;width:100%;margin-top:8px;padding:14px 10px;background:rgba(255,255,255,0.58);border-radius:12px;overflow:hidden;}
.body.fortune{display:flex;align-items:center;justify-content:center;max-height:58%;writing-mode:vertical-lr;text-orientation:upright;font-size:0.9rem;line-height:1.85;color:#333;}
.body.fortune p{margin:0 6px;}
.body.gua{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;max-height:62%;}
.body.gua .guayao{font-family:Consolas,'Courier New',monospace;font-size:0.7rem;line-height:1.32;white-space:pre;text-align:center;margin:0;color:#3d2e1e;}
.body.gua .poetry-wrap{display:flex;justify-content:center;max-height:46%;overflow:hidden;}
.body.gua .poetry{margin:0;writing-mode:vertical-lr;text-orientation:upright;font-size:0.86rem;line-height:1.8;color:#3d3550;white-space:pre-wrap;}
.body.gua .desc{margin:0;font-size:0.72rem;line-height:1.5;color:#666;text-align:center;max-height:24%;overflow:hidden;}
.footer{margin-top:6px;font-size:0.8rem;color:#999;text-align:center;flex-shrink:0;}
.media{flex:0 0 var(--iw);height:100%;position:relative;}
.media-bg{width:100%;height:100%;overflow:hidden;background:#141820;}
.media-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:24px 16px;box-sizing:border-box;background:linear-gradient(180deg,rgba(15,23,42,0.05),rgba(15,23,42,0.25));}
.media-overlay img{width:100%;max-width:380px;max-height:88%;object-fit:cover;border-radius:18px;box-shadow:0 16px 44px rgba(0,0,0,0.38);border:4px solid rgba(255,255,255,0.9);}
`

function coverImgHtml (filePath, boxW, boxH) {
  const lay = layoutForImage(filePath, boxW, boxH)
  return `<div class="media-bg"><img src="${lay.url}" style="${lay.imgCss}" alt=""/></div>`
}

export function mediaAvatarOverlay (avatarUrl) {
  return `<div class="media-overlay"><img src="${escHtml(avatarUrl)}" alt=""/></div>`
}

/** 左文右图长图（运势 / 算卦 / 老婆） */
export function fortuneSplitHtml ({
  titleLines,
  bodyHtml,
  filePath,
  canvasW = CANVAS_SPLIT.width,
  canvasH = CANVAS_SPLIT.height,
  textRatio = 0.36,
  footerText = '| 相信科学，请勿迷信 |',
  mediaOverlay = ''
}) {
  const textW = Math.round(canvasW * textRatio)
  const imgW = canvasW - textW
  const footer = footerText ? `<p class="footer">${escHtml(footerText)}</p>` : ''
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"/><style>
${FONT_CSS}
:root{--cw:${canvasW}px;--ch:${canvasH}px;--tw:${textW}px;--iw:${imgW}px;}
${SPLIT_CSS}
</style></head><body><div class="wrap"><div class="text"><div class="text-main">${titleLines}${bodyHtml}</div>${footer}</div><div class="media">${coverImgHtml(filePath, imgW, canvasH)}${mediaOverlay}</div></div></body></html>`
}

export function fortuneBodyHtml (signText, unsignText) {
  return `<div class="body fortune"><p>${escHtml(signText)}</p><p>${escHtml(unsignText)}</p></div>`
}

export function guaBodyHtml (fortune) {
  return `<div class="body gua"><pre class="guayao">${escHtml(fortune.guayao)}</pre><div class="poetry-wrap"><p class="poetry">${escHtml(fortune.Poetry)}</p></div><p class="desc">${escHtml(fortune.description)}</p></div>`
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
.quote{font-style:italic;color:#666;margin:8px auto;display:flex;justify-content:center;writing-mode:vertical-lr;text-orientation:upright;max-height:120px;font-size:0.95rem;}
#footer{padding:14px;background:#f8f9fa;text-align:center;border-top:1px solid #eee;font-size:0.95rem;}
.highlight{font-weight:bold;color:#0078d7;}
</style></head><body><div id="main"><div id="header">${header}</div><div id="content"><div>${escHtml(date)}</div><div class="img-box"><img src="${lay.url}" style="${lay.imgCss}" alt=""/></div><p class="quote">「${escHtml(quote)}」</p></div><div id="footer">${footer}</div></div></body></html>`
}

export { toFileUrl }
