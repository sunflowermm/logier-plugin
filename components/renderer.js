import { Plugin_Name } from '../model/path.js'
import Version from './Version.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import { FileUtils } from '../../../lib/utils/file-utils.js'

const _path = process.cwd()
const INLINE_TPL = `./plugins/${Plugin_Name}/resources/common/inline.html`

/** 与 RendererLoader / puppeteer-compat 对齐的默认截图参数（勿再加 userTriggered） */
export const PLUGIN_RENDER_OPTS = {
  quality: 100,
  imgType: 'png',
  deviceScaleFactor: 2,
  imageWaitTimeout: 3000,
  fontWaitTimeout: 2000,
  pageGotoParams: { waitUntil: 'domcontentloaded' }
}

function buildRenderData (params, renderOpts = {}, scale = 1) {
  const layoutPath = `${_path}/plugins/${Plugin_Name}/resources/common/layout/`
  const resPath = `../../../../../plugins/${Plugin_Name}/resources/`
  return {
    ...params,
    ...PLUGIN_RENDER_OPTS,
    ...renderOpts,
    _plugin: Plugin_Name,
    saveId: params.saveId || params.save_id || 'tpl',
    pluResPath: resPath,
    _res_path: resPath,
    _layout_path: layoutPath,
    defaultLayout: `${layoutPath}default.html`,
    elemLayout: `${layoutPath}elem.html`,
    sys: {
      scale: `style=transform:scale(${scale})`,
      copyright: `XRK-Yunzai<span class="version">${Version.yunzai}</span> & 鸢尾花插件<span class="version">${Version.ver}</span> · 向日葵维护版`
    }
  }
}

function atUser (e) {
  return segment.at(e.user_id)
}

async function replyAtImage (e, img, prefix) {
  const msg = [atUser(e)]
  if (prefix != null && prefix !== '') {
    if (Array.isArray(prefix)) msg.push(...prefix.filter((p) => p != null && p !== ''))
    else msg.push(prefix)
  }
  msg.push(img)
  return e.reply(msg)
}

/**
 * 内联 HTML → puppeteer.screenshot（compat 已把 Buffer 包成 segment.image）
 * 经 inline.html 的 {{@html}} 注入，避免 art-template 误解析 @font-face。
 */
export async function renderHtmlImage (html, extra = {}) {
  const fullPage = extra.fullPage === true
  return puppeteer.screenshot(`${Plugin_Name}/inline/render`, {
    tplFile: INLINE_TPL,
    html,
    saveId: `_inline_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    width: extra.width ?? 1280,
    height: extra.height ?? 900,
    ...PLUGIN_RENDER_OPTS,
    ...extra,
    fullPage,
    selector: extra.selector ?? (fullPage ? undefined : '.wrap')
  })
}

/** 截图失败则纯文本兜底（同条 @） */
export async function screenshotHtmlWithFallback (e, html, textFallback, extra = {}) {
  const img = await renderHtmlImage(html, extra)
  if (img) {
    await replyAtImage(e, img, extra.replyPrefix)
    return true
  }
  if (textFallback) {
    const tail = Array.isArray(textFallback) ? textFallback : [textFallback]
    await e.reply([atUser(e), ...tail])
  }
  return false
}

/** 模板截图：plugins/<名>/resources/<app>/<tpl>.html → lib/puppeteer shim */
export default async function render (tplPath, params, cfg = {}) {
  const [app, tpl] = tplPath.split('/')
  const { e, renderOpts = {}, scale = 1 } = cfg
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
    await replyAtImage(e, img)
    return true
  }
  if (img) return img
  return Boolean(cfg.retMsgId)
}
