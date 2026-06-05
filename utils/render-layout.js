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



function coverImgHtml (filePath, boxW, boxH) {

  const lay = layoutForImage(filePath, boxW, boxH)

  return `<div class="media-bg" style="width:${boxW}px;height:${boxH}px;overflow:hidden;background:#1a1a2e;"><img src="${lay.url}" style="${lay.imgCss}" alt=""/></div>`

}



export function mediaAvatarOverlay (avatarUrl) {

  return `<div class="media-overlay"><img src="${escHtml(avatarUrl)}" alt=""/></div>`

}



const BODY_STYLE = {

  fortune: `.body{flex:1;margin-top:12px;padding:16px 12px;background:rgba(255,255,255,0.55);border-radius:12px;writing-mode:vertical-lr;text-orientation:upright;max-height:62%;overflow:hidden;font-size:0.95rem;line-height:1.8;}`,

  gua: `.body{flex:1;margin-top:10px;padding:14px 12px;background:rgba(255,255,255,0.55);border-radius:12px;max-height:68%;overflow:hidden;text-align:left;width:100%;}

.body .guayao{font-family:Consolas,'Courier New',monospace;font-size:0.78rem;line-height:1.3;white-space:pre;margin:0 0 10px;color:#2c2416;letter-spacing:-0.5px;}

.body .poetry{white-space:pre-wrap;font-size:0.88rem;line-height:1.65;margin:6px 0;color:#3d3550;}

.body .desc{font-size:0.8rem;line-height:1.55;color:#555;margin-top:8px;}`

}



const MEDIA_OVERLAY_CSS = `.media{position:relative;}

.media-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:28px 20px;box-sizing:border-box;background:linear-gradient(180deg,rgba(15,23,42,0.06),rgba(15,23,42,0.28));}

.media-overlay img{width:100%;max-width:400px;max-height:90%;object-fit:cover;border-radius:20px;box-shadow:0 18px 50px rgba(0,0,0,0.4);border:4px solid rgba(255,255,255,0.92);}`



/** 左文右图竖版长图（运势 / 算卦 / 老婆） */

export function fortuneSplitHtml ({

  titleLines,

  bodyHtml,

  filePath,

  canvasW = CANVAS_SPLIT.width,

  canvasH = CANVAS_SPLIT.height,

  textRatio = 0.34,

  footerText = '| 相信科学，请勿迷信 |',

  bodyMode = 'fortune',

  mediaOverlay = ''

}) {

  const textW = Math.round(canvasW * textRatio)

  const imgW = canvasW - textW

  const imgBlock = coverImgHtml(filePath, imgW, canvasH)

  const footer = footerText ? `<p class="footer">${escHtml(footerText)}</p>` : ''

  const bodyCss = BODY_STYLE[bodyMode] || BODY_STYLE.fortune

  const overlayCss = mediaOverlay ? MEDIA_OVERLAY_CSS : ''

  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"/><style>

${FONT_CSS}

html,body{margin:0;padding:0;width:${canvasW}px;height:${canvasH}px;overflow:hidden;font-family:'HYWH','Microsoft YaHei',sans-serif;background:#f4f0eb;}

.wrap{display:flex;width:${canvasW}px;height:${canvasH}px;}

.text{flex:0 0 ${textW}px;height:100%;box-sizing:border-box;padding:28px 20px;background:rgba(255,255,255,0.82);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;text-align:center;box-shadow:inset -1px 0 0 rgba(0,0,0,0.06);}

.text h2{margin:8px 0;font-size:1.35rem;color:#5c4a32;line-height:1.35;}

.text p{margin:6px 0;line-height:1.65;color:#333;font-size:1rem;}
.text .wife-name{font-size:1.2rem;font-weight:bold;color:#5c4a32;}

${bodyCss}

${overlayCss}

.media{flex:0 0 ${imgW}px;height:100%;}

.footer{margin-top:auto;font-size:0.85rem;color:#888;}

</style></head><body><div class="wrap"><div class="text">${titleLines}${bodyHtml}${footer}</div><div class="media">${imgBlock}${mediaOverlay}</div></div></body></html>`

}



export function guaBodyHtml (fortune) {

  return `<div class="body"><pre class="guayao">${escHtml(fortune.guayao)}</pre><p class="poetry">${escHtml(fortune.Poetry)}</p><p class="desc">${escHtml(fortune.description)}</p></div>`

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

.quote{font-style:italic;color:#666;margin:8px 0 4px;writing-mode:vertical-lr;text-orientation:upright;display:inline-block;max-height:120px;font-size:0.95rem;}

#footer{padding:14px;background:#f8f9fa;text-align:center;border-top:1px solid #eee;font-size:0.95rem;}

.highlight{font-weight:bold;color:#0078d7;}

</style></head><body><div id="main"><div id="header">${header}</div><div id="content"><div>${escHtml(date)}</div><div class="img-box"><img src="${lay.url}" style="${lay.imgCss}" alt=""/></div><p class="quote">「${escHtml(quote)}」</p></div><div id="footer">${footer}</div></div></body></html>`

}



export { toFileUrl }


