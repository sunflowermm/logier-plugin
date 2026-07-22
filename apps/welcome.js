import { readAndParseJSON } from '../utils/getdate.js'
import { isWelcomeGroupAllowed } from '../model/welcome-config.js'
import plugin from '../../../lib/plugins/plugin.js'

export class newcomer extends plugin {
  constructor () {
    super({
      name: '[鸢尾花插件]进退群群通知',
      dsc: '进退群群通知',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'notice.group.increase',
      priority: 4999
    })
  }

  /** 接受到消息都会执行一次 */
  async accept (e) {
    /** 冷却cd 30s */
    let cd = 30

    if (this.e.user_id === this.e.bot.uin) return

    // 白名单：仅配置的群发送入群欢迎
    if (!await isWelcomeGroupAllowed(this.e.group_id)) return

    /** cd */
    let key = `Yz:newcomers:${this.e.group_id}`
    if (await redis.get(key)) return
    redis.set(key, '1', { EX: cd })

    let welcome = await readAndParseJSON('../data/welcome.json')
    if (!Array.isArray(welcome) || welcome.length === 0) return

    let nickname
    if (e.nickname) {
      nickname = e.nickname
    } else if (e.sender && e.sender.card) {
      nickname = e.sender.card
    } else {
      // 从成员列表里获取该用户昵称
      let memberMap = await e.group.getMemberMap()
      nickname = (memberMap && memberMap.get(e.user_id)) ? memberMap.get(e.user_id).nickname : ''
    }

    let randomIndex = Math.floor(Math.random() * welcome.length)
    let msg = welcome[randomIndex].replace('{0}', nickname)

    /** 回复 */
    await this.reply([
      segment.at(this.e.user_id),
      msg
    ])
  }
}


