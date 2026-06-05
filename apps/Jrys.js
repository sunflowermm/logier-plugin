import { screenshotHtmlWithFallback } from '../components/renderer.js'
import { readAndParseJSON, numToChinese } from '../utils/getdate.js'
import { pickRenderBackground, fortuneSplitHtml } from '../utils/render-layout.js'

const REDIS_KEY = (uid) => `Yunzai:logier-plugin:${uid}_jrys`

export class TextMsg extends plugin {
  constructor () {
    super({
      name: '[鸢尾花插件]今日运势',
      dsc: '今日运势',
      event: 'message',
      priority: -5000,
      rule: [
        { reg: '^#?(今日运势|运势)$', fnc: '今日运势' },
        { reg: '^#?(悔签|重新抽取运势)$', fnc: '悔签' }
      ]
    })
  }

  async 今日运势 (e) {
    const jrys = await readAndParseJSON('../data/jrys.json')
    const now = new Date().toLocaleDateString('zh-CN')
    const raw = await redis.get(REDIS_KEY(e.user_id))
    let data = raw ? JSON.parse(raw) : null
    let replymessage

    if (data?.time === now) {
      replymessage = '今日已抽取运势，让我帮你找找签……'
    } else {
      replymessage = '正在为您测算今日的运势……'
      data = {
        fortune: jrys[Math.floor(Math.random() * jrys.length)],
        time: now,
        isRe: false
      }
      await redis.set(REDIS_KEY(e.user_id), JSON.stringify(data))
    }

    await e.reply(replymessage, true, { recallMsg: 10 })
    await renderFortune(e, data)
    return true
  }

  async 悔签 (e) {
    const jrys = await readAndParseJSON('../data/jrys.json')
    const now = new Date().toLocaleDateString('zh-CN')
    const raw = await redis.get(REDIS_KEY(e.user_id))
    let data = raw ? JSON.parse(raw) : null
    let replymessage

    if (!data || data.time !== now) {
      replymessage = '正在为您测算今日的运势……'
      data = { fortune: jrys[Math.floor(Math.random() * jrys.length)], time: now, isRe: false }
    } else if (data.isRe) {
      replymessage = '今天已经悔过签了，再给你看一眼吧……'
    } else {
      replymessage = '异象骤生，运势竟然改变了……'
      data = { fortune: jrys[Math.floor(Math.random() * jrys.length)], time: now, isRe: true }
    }

    if (replymessage.startsWith('正在') || replymessage.startsWith('异象')) {
      await redis.set(REDIS_KEY(e.user_id), JSON.stringify(data))
    }

    await e.reply(replymessage, true, { recallMsg: 10 })
    await renderFortune(e, data)
    return true
  }
}

async function renderFortune (e, data) {
  const filePath = pickRenderBackground('fortune')
  const nickname = e.nickname || e.sender?.card || '旅人'
  const fortune = data.fortune
  const dayCn = await numToChinese(new Date().getDate())

  const html = fortuneSplitHtml({
    filePath,
    titleLines: `<p>${nickname}的${dayCn}号运势为</p><h2>${fortune.fortuneSummary}</h2><p>${fortune.luckyStar}</p>`,
    bodyHtml: `<div class="body"><p>${fortune.signText}</p><p>${fortune.unsignText}</p></div>`
  })

  const fallback = [
    segment.at(e.user_id),
    `${dayCn}号运势：${fortune.fortuneSummary}\n${fortune.luckyStar}\n${fortune.signText}\n${fortune.unsignText}`
  ]
  await screenshotHtmlWithFallback(e, html, fallback)
}
