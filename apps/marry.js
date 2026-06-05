import { renderHtmlImage } from '../components/renderer.js'
import { getLocalGalleryImage, pluginAssetUrl } from '../utils/getdate.js'

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
    const date_time = formatDate(new Date())
    const marrydata = JSON.parse(await redis.get(`Yunzai:logier-plugin:${e.group_id}_${e.user_id}_marry`) || 'null')
    const [randomWife] = await getRandomWife(e)

    if (!randomWife) {
      await e.reply('群里没有可抽取的成员哦~')
      return true
    }

    if (marrydata?.lastmarryDate === date_time) {
      await renderMarry(
        e,
        `今天已经迎娶【${marrydata.lastmarry.nickname}】了哦~`,
        marrydata.lastmarry.nickname
      )
      return true
    }

    const marry = {
      lastmarryDate: date_time,
      lastmarry: randomWife,
      isRemarry: marrydata?.isRemarry || false
    }
    await redis.set(`Yunzai:logier-plugin:${e.group_id}_${e.user_id}_marry`, JSON.stringify(marry))
    await renderMarry(e, `${randomWife.nickname} 成为了你的新老婆哦~`, randomWife.nickname)
    return true
  }
}

function formatDate (date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function getRandomWife (e) {
  const mmap = await e.group.getMemberMap()
  const arrMember = Array.from(mmap.values())
  const excludeUserIds = new Set([String(e.self_id), String(e.user_id), '2854196310'])
  const filtered = arrMember.filter(m => !excludeUserIds.has(String(m.user_id)))
  if (!filtered.length) return [null]
  return [filtered[Math.floor(Math.random() * filtered.length)]]
}

async function renderMarry (e, replyMessage, wifeName) {
  const imageUrl = await getLocalGalleryImage()
  const poems = [
    '百年推甲子，福地在春申',
    '红毹拥出态娇妍，璧合珠联看并肩',
    '佳偶天成心相印，百年好合乐无边',
    '琴韵谱成同梦语，灯花笑对含羞人'
  ]
  const content = poems[Math.floor(Math.random() * poems.length)]

  const html = `<!DOCTYPE html>
<html>
<head>
<style>
@font-face { font-family: 'HYWH'; src: url('${pluginAssetUrl('resources/common/font/HYWH-65W.woff')}') format('woff'); }
html, body { margin: 0; font-family: 'HYWH', 'Microsoft YaHei', sans-serif; background: rgba(255,255,255,0.6); }
.fortune { width: 35%; height: 900px; float: left; text-align: center; }
.content { margin: 12px auto; padding: 12px; height: 520px; background: rgba(255,255,255,0.7); border-radius: 15px; writing-mode: vertical-rl; font-size: 1.8em; }
.image { height: 900px; width: 62%; float: right; text-align: center; }
.image img { height: 100%; object-fit: cover; }
h2 { font-size: 2em; }
</style>
</head>
<body>
<div class="fortune">
  <h2>今日老婆</h2>
  <p style="font-size:1.4em;font-weight:bold">${wifeName}</p>
  <div class="content"><p>${content}</p></div>
</div>
<div class="image"><img src="${imageUrl}" /></div>
</body>
</html>`

  const img = await renderHtmlImage(html)
  if (img) {
    await e.reply([replyMessage, img], true)
  } else {
    await e.reply(`${replyMessage}\n${wifeName}\n${content}`)
  }
}
