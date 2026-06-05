import { screenshotHtmlWithFallback } from '../components/renderer.js'
import { readAndParseJSON, getLocalGalleryImage, pluginAssetUrl } from '../utils/getdate.js'

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
  const imageUrl = await getLocalGalleryImage()
  const fortune = data.fortune
  const nickname = e.nickname || e.sender?.card || '旅人'
  const topic = e.msg.replace(/^#?(算一卦|算卦)/, '').trim()
  const intro = `${nickname}心中所念${topic ? `「${topic}」` : ''}，卦象如下：`

  const html = `<!DOCTYPE html>
<html>
<head>
<style>
@font-face { font-family: 'HYWH'; src: url('${pluginAssetUrl('resources/common/font/HYWH-65W.woff')}') format('woff'); }
html, body { margin: 0; font-family: 'HYWH', 'Microsoft YaHei', sans-serif; }
.nei { float: left; width: 50%; min-width: 400px; min-height: 1024px; background: rgba(255,255,255,0.85); border-radius: 10px; box-shadow: 3px 3px 3px #666; }
.tu { float: left; }
p { color: rgba(0,0,0,0.65); font-size: 1.5rem; text-align: center; font-weight: bold; white-space: pre-wrap; }
.centered-content { padding: 1em; }
</style>
</head>
<body>
<div class="tu"><img src="${imageUrl}" height="1024" /></div>
<div class="nei">
  <div class="centered-content">
    <b style="font-size:1.5em">${intro}</b>
    <p>${fortune.guayao}</p>
    <p>${fortune.guachi}</p>
    <p>${fortune.name}\n${fortune.Poetry}</p>
    <p>${fortune.description}</p>
  </div>
</div>
</body>
</html>`

  const fallback = [
    intro,
    fortune.guachi,
    fortune.name,
    fortune.Poetry,
    fortune.description
  ].join('\n')
  await screenshotHtmlWithFallback(e, html, fallback)
}
