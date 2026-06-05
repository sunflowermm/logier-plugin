import { screenshotHtmlWithFallback } from '../components/renderer.js'
import { getTimeOfDay, getLocalGalleryImage } from '../utils/getdate.js'

const SIGN_QUOTES = [
  '生活明朗，万物可爱。',
  '心有所向，日复一日，必有所成。',
  '今日事今日毕，明日更有新风景。',
  '保持热爱，奔赴下一场山海。',
  '愿你眼里有光，心中有爱。'
]

export class TextMsg extends plugin {
  constructor () {
    super({
      name: '[鸢尾花插件]今日签到',
      dsc: '今日签到',
      event: 'message',
      priority: 5000,
      rule: [
        { reg: '^#?(今日)?(签到|打卡)$', fnc: '今日签到' }
      ]
    })
  }

  async 今日签到 (e) {
    const now = new Date()
    const datatime = now.toLocaleDateString('zh-CN')
    const content = SIGN_QUOTES[Math.floor(Math.random() * SIGN_QUOTES.length)]
    const imageUrl = await getLocalGalleryImage()

    let data = JSON.parse(await redis.get(`Yunzai:logier-plugin:${e.user_id}_sign`) || 'null')
    const addfavor = Math.floor(Math.random() * 10) + 1
    let issign = `好感度+${addfavor}`

    if (!data) {
      data = { favor: addfavor, time: datatime }
    } else if (data.time !== datatime) {
      data.favor += addfavor
      data.time = datatime
    } else {
      issign = '今日已经签到了'
    }

    await redis.set(`Yunzai:logier-plugin:${e.user_id}_sign`, JSON.stringify(data))

    const groupKey = `Yunzai:logier-plugin:group${e.group_id}_sign`
    const groupdata = JSON.parse(await redis.get(groupKey) || '{}')
    groupdata[e.user_id] = data.favor
    await redis.set(groupKey, JSON.stringify(groupdata))

    const favorValues = Object.values(groupdata).sort((a, b) => b - a)
    const position = favorValues.indexOf(data.favor) + 1
    const nickname = e.nickname || e.sender?.card || '旅人'

    const html = `<!DOCTYPE html>
<html lang="zh">
<head>
<style>
body { margin: 0; font-family: 'Microsoft YaHei', sans-serif; background: #f5f5f5; color: #333; }
#main { width: 800px; margin: 20px auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); background: #fff; overflow: hidden; }
#header { padding: 20px; background: linear-gradient(135deg, #f0f8ff, #cce7ff); }
#header span { font-size: 1.2rem; font-weight: bold; color: #0078d7; }
#content { padding: 20px; text-align: center; }
#content img { width: 100%; border-radius: 10px; margin: 10px 0; }
.quote { font-style: italic; color: #777; }
#footer { padding: 20px; background: #f8f9fa; text-align: center; border-top: 1px solid #eee; }
.highlight { font-weight: bold; color: #0078d7; }
</style>
</head>
<body>
<div id="main">
  <div id="header"><p><span>${getTimeOfDay()}好！</span>${nickname}</p><p>${issign}</p></div>
  <div id="content"><div>${datatime}</div><img src="${imageUrl}" /><p class="quote">「${content}」</p></div>
  <div id="footer">当前好感度：<span class="highlight">${data.favor}</span>，群排名：<span class="highlight">第${position}位</span></div>
</div>
</body>
</html>`

    const fallback = `${nickname} ${issign}\n好感度 ${data.favor}，群排名第 ${position} 位\n「${content}」`
    await screenshotHtmlWithFallback(e, html, fallback)
    return true
  }
}
