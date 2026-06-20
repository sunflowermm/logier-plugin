import plugin from '../../../lib/plugins/plugin.js'
import { screenshotHtmlWithFallback } from '../components/renderer.js'
import {
  pickRenderBackground,
  fortuneSplitHtml,
  avatarBoxHtml,
  qqAvatarDataUrl,
  escHtml,
  CANVAS_SPLIT
} from '../utils/render-layout.js'

function slimMember (member) {
  return {
    user_id: String(member.user_id),
    nickname: member.card || member.nickname || String(member.user_id)
  }
}

export class example extends plugin {
  constructor () {
    super({
      name: '[鸢尾花插件]今日老婆',
      dsc: '今日老婆',
      event: 'message',
      priority: -5000,
      rule: [
        { reg: '^(#|/)?(今日老婆|marry)$', fnc: '今日老婆' }
      ]
    })
  }

  async 今日老婆 (e) {
    if (!e.isGroup) {
      await e.reply('请在群内使用今日老婆哦~')
      return true
    }

    const dateTime = formatDate(new Date())
    const cacheKey = `Yunzai:logier-plugin:${e.group_id}_${e.user_id}_marry`
    const marrydata = JSON.parse(await redis.get(cacheKey) || 'null')
    const [randomWife] = await getRandomWife(e)

    if (!randomWife) {
      await e.reply('群里没有可抽取的成员哦~')
      return true
    }

    if (marrydata?.lastmarryDate === dateTime) {
      await renderMarry(e, `今天已经迎娶【${marrydata.lastmarry.nickname}】了哦~`, marrydata.lastmarry)
      return true
    }

    await redis.set(cacheKey, JSON.stringify({
      lastmarryDate: dateTime,
      lastmarry: randomWife
    }))
    await renderMarry(e, `${randomWife.nickname} 成为了你的新老婆哦~`, randomWife)
    return true
  }
}

function formatDate (date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

async function getRandomWife (e) {
  const mmap = await e.group.getMemberMap()
  const exclude = new Set([String(e.self_id), String(e.user_id), '2854196310'])
  const filtered = Array.from(mmap.values())
    .filter(m => !exclude.has(String(m.user_id)))
    .map(slimMember)
  if (!filtered.length) return [null]
  return [filtered[Math.floor(Math.random() * filtered.length)]]
}

async function renderMarry (e, replyMessage, wife) {
  const poems = [
    '百年推甲子，福地在春申',
    '红毹拥出态娇妍，璧合珠联看并肩',
    '佳偶天成心相印，百年好合乐无边',
    '琴韵谱成同梦语，灯花笑对含羞人'
  ]
  const content = poems[Math.floor(Math.random() * poems.length)]
  const avatarSrc = await qqAvatarDataUrl(wife.user_id)
  const html = fortuneSplitHtml({
    filePath: pickRenderBackground(),
    textRatio: 0.36,
    footerText: '',
    avatarHtml: avatarBoxHtml(avatarSrc),
    titleLines: `<h2>今日老婆</h2><p class="wife-name">${escHtml(wife.nickname)}</p>`,
    bodyHtml: `<div class="body fortune"><p>${escHtml(content)}</p></div>`
  })

  await screenshotHtmlWithFallback(
    e,
    html,
    `${wife.nickname}\n${content}`,
    { ...CANVAS_SPLIT, imageWaitTimeout: 5000, replyPrefix: replyMessage }
  )
}
