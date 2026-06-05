import { screenshotHtmlWithFallback } from '../components/renderer.js'
import { readAndParseJSON } from '../utils/getdate.js'
import { pickRenderBackground, guaSplitHtml } from '../utils/render-layout.js'

const REDIS_KEY = (uid) => `Yunzai:logier-plugin:${uid}_suangua`

export class TextMsg extends plugin {
  constructor () {
    super({
      name: '[鸢尾花插件]算一卦',
      dsc: '算一卦',
      event: 'message',
      priority: -5000,
      rule: [
        { reg: '^#?(算一卦|算卦).*$', fnc: '算一卦' },
        { reg: '^#?(悔卦|逆天改命).*$', fnc: '悔卦' }
      ]
    })
  }

  async 算一卦 (e) {
    const suangua = await readAndParseJSON('../data/suangua.json')
    const now = new Date().toLocaleDateString('zh-CN')
    const raw = await redis.get(REDIS_KEY(e.user_id))
    let data = raw ? JSON.parse(raw) : null
    let replymessage

    if (data?.time === now) {
      replymessage = '今日已算卦，再给你看一眼吧……'
    } else {
      replymessage = '正在为您算卦……'
      data = {
        fortune: suangua[Math.floor(Math.random() * suangua.length)],
        time: now,
        isRe: false
      }
      await redis.set(REDIS_KEY(e.user_id), JSON.stringify(data))
    }

    await e.reply(replymessage, true, { recallMsg: 10 })
    await renderFortune(e, data)
    return true
  }

  async 悔卦 (e) {
    const suangua = await readAndParseJSON('../data/suangua.json')
    const now = new Date().toLocaleDateString('zh-CN')
    const raw = await redis.get(REDIS_KEY(e.user_id))
    let data = raw ? JSON.parse(raw) : null
    let replymessage

    if (!data || data.time !== now) {
      replymessage = '正在为您算卦……'
      data = { fortune: suangua[Math.floor(Math.random() * suangua.length)], time: now, isRe: false }
    } else if (data.isRe) {
      replymessage = '今天已经悔过卦了，再给你看一眼吧……'
    } else {
      replymessage = '异象骤生，卦象竟然改变了……'
      data = { fortune: suangua[Math.floor(Math.random() * suangua.length)], time: now, isRe: true }
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
  const filePath = pickRenderBackground('wide')
  const fortune = data.fortune
  const nickname = e.nickname || e.sender?.card || '旅人'
  const topic = e.msg.replace(/^#?(算一卦|算卦)/, '').trim()
  const intro = `${nickname}心中所念${topic ? `「${topic}」` : ''}，卦象如下：`

  const html = guaSplitHtml({
    filePath,
    intro,
    paragraphs: [fortune.guayao, fortune.guachi, `${fortune.name}\n${fortune.Poetry}`, fortune.description]
  })

  const fallback = [intro, fortune.guachi, fortune.name, fortune.Poetry, fortune.description].join('\n')
  await screenshotHtmlWithFallback(e, html, fallback)
}
