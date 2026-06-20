import { Plugin_Name } from './constants.js'
import Data from './Data.js'
import Version from './Version.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import { FileUtils } from '../../../lib/utils/file-utils.js'

const _path = process.cwd()
const INLINE_TPL = `./plugins/${Plugin_Name}/resources/common/inline.html`

/** 插件内 HTML / 模板截图默认参数（PNG + 2x DPR） */
export const PLUGIN_RENDER_OPTS = {
  quality: 100,
  imgType: 'png',
  deviceScaleFactor: 2,
  imageWaitTimeout: 3000,
  fontWaitTimeout: 2000,
  pageGotoParams: { waitUntil: 'load' }
}

function buildRenderData (params, renderOpts = {}, scale = 1) {
  const layoutPath = `${_path}/plugins/${Plugin_Name}/resources/common/layout/`
  const resPath = `../../../../../plugins/${Plugin_Name}/resources/`
  const merged = { ...PLUGIN_RENDER_OPTS, ...renderOpts }

  return {
    ...params,
    ...merged,
    _plugin: Plugin_Name,
    saveId: params.saveId || params.save_id || 'tpl',
    pluResPath: resPath,
    _res_path: resPath,
    _layout_path: layoutPath,
    _tpl_path: `${_path}/plugins/${Plugin_Name}/resources/common/tpl/`,
    defaultLayout: `${layoutPath}default.html`,
    elemLayout: `${layoutPath}elem.html`,
    pageGotoParams: merged.pageGotoParams ?? { waitUntil: 'load' },
    quality: merged.quality ?? 100,
    imgType: merged.imgType ?? 'png',
    deviceScaleFactor: merged.deviceScaleFactor ?? 2,
    imageWaitTimeout: merged.imageWaitTimeout ?? 3000,
    fontWaitTimeout: merged.fontWaitTimeout ?? 2000,
    userTriggered: true,
    priority: true,
    sys: {
      scale: `style=transform:scale(${scale})`,
      copyright: `XRK-Yunzai<span class="version">${Version.yunzai}</span> & 鸢尾花插件<span class="version">${Version.ver}</span> · 向日葵维护版`
    }
  }
}

/** 截图结果 → 可 reply 的图片消息（PuppeteerRenderer 返回 Buffer，须 segment.image） */
export function toReplyImage (img) {
  if (!img) return img
  if (typeof img === 'object' && img.type === 'image') return img
  return segment.image(img)
}

/** @ 触发者，与图片等同条消息发出 */
export function atUser (e) {
  return segment.at(e.user_id)
}

/** 合并 @、可选前缀文案与图片为一条消息 */
export async function replyAtImage (e, img, prefix) {
  const msg = [atUser(e)]
  if (prefix != null && prefix !== '') {
    if (Array.isArray(prefix)) msg.push(...prefix.filter(p => p != null && p !== ''))
    else msg.push(prefix)
  }
  msg.push(img)
  return e.reply(msg)
}

/**
 * 内联 HTML 截图：经 inline.html（{{@html}}）注入，避免整页 HTML 被 art-template 误解析（如 @font-face）。
 */
export async function renderHtmlImage (html, extra = {}) {
  const saveId = `_inline_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const data = {
    tplFile: INLINE_TPL,
    html,
    saveId,
    fullPage: extra.fullPage ?? true,
    width: extra.width ?? 1280,
    height: extra.height ?? 900,
    ...PLUGIN_RENDER_OPTS,
    ...extra
  }
  return puppeteer.screenshot(`${Plugin_Name}/inline/render`, data)
}

export async function screenshotHtml (e, html, extra = {}) {
  const img = await renderHtmlImage(html, extra)
  if (!img) return false
  await replyAtImage(e, toReplyImage(img), extra.replyPrefix)
  return true
}

/** 渲染失败时用纯文本兜底（同样带 @） */
export async function screenshotHtmlWithFallback (e, html, textFallback, extra = {}) {
  const img = await renderHtmlImage(html, extra)
  if (img) {
    await replyAtImage(e, toReplyImage(img), extra.replyPrefix)
    return true
  }
  if (textFallback) {
    const tail = Array.isArray(textFallback) ? textFallback : [textFallback]
    await e.reply([atUser(e), ...tail])
  }
  return false
}

export default async function render (tplPath, params, cfg = {}) {
  const [app, tpl] = tplPath.split('/')
  const { e, renderOpts = {}, scale = 1 } = cfg

  Data.createDir(`data/html/${Plugin_Name}/${app}/${tpl}`, 'root')

  const data = {
    ...buildRenderData(params, renderOpts, scale),
    tplFile: `./plugins/${Plugin_Name}/resources/${app}/${tpl}.html`,
    saveId: params.saveId || params.save_id || tpl
  }

  if (process.argv.includes('web-debug')) {
    const saveDir = `${_path}/data/ViewData/`
    FileUtils.ensureDirSync(saveDir)
    data._app = app
    FileUtils.writeFileSync(`${saveDir}${tpl}.json`, JSON.stringify(data))
  }

  const img = await puppeteer.screenshot(`${Plugin_Name}/${app}/${tpl}`, data)
  if (img && e) {
    await replyAtImage(e, toReplyImage(img))
    return true
  }
  if (img) return img
  return cfg.retMsgId ? true : false
}
