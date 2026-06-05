import { Data, Version, Plugin_Name } from './index.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import fs from 'fs'
import path from 'node:path'

const _path = process.cwd()

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
      copyright: `欢迎加QQ交流群：1037125467<br>XRK-Yunzai<span class="version">${Version.yunzai}</span> & 鸢尾花插件<span class="version">${Version.ver}</span>`
    }
  }
}

/** 将内联 HTML 写入临时文件并截图，返回 segment 或 false */
export async function renderHtmlImage (html, extra = {}) {
  const dir = path.join(_path, 'data/html', Plugin_Name, '_inline')
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, `${Date.now()}_${Math.random().toString(36).slice(2)}.html`)
  fs.writeFileSync(file, html, 'utf8')
  try {
    const data = {
      tplFile: file,
      saveId: '_inline',
      fullPage: extra.fullPage ?? true,
      ...PLUGIN_RENDER_OPTS,
      ...extra
    }
    return puppeteer.screenshot(`${Plugin_Name}/_inline/_inline`, data)
  } finally {
    try { fs.unlinkSync(file) } catch { /* ignore */ }
  }
}

export async function screenshotHtml (e, html, extra = {}) {
  const img = await renderHtmlImage(html, extra)
  if (img) return e.reply(img)
  return false
}

/** 渲染失败时用纯文本兜底 */
export async function screenshotHtmlWithFallback (e, html, textFallback, extra = {}) {
  const ok = await screenshotHtml(e, html, extra)
  if (!ok && textFallback) await e.reply(textFallback)
  return ok
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
    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir)
    data._app = app
    fs.writeFileSync(`${saveDir}${tpl}.json`, JSON.stringify(data))
  }

  const base64 = await puppeteer.screenshot(`${Plugin_Name}/${app}/${tpl}`, data)
  if (base64) return e.reply(base64)
  return cfg.retMsgId ? true : true
}
